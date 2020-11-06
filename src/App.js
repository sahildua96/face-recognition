import React, { Component } from 'react';
import Navigation from './Components/Navigation/Navigation';
import Logo from './Components/Logo/Logo';
import ImageLinkForm from './Components/ImageLinkForm/ImageLinkForm';
import Rank from './Components/Rank/Rank';
import Signin from './Components/Signin/Signin';
import Register from './Components/Register/Register';
import FaceRecognition from './Components/FaceRecognition/FaceRecognition';
import Particles from 'react-particles-js';
import './App.css';



const particlesOption ={
  particles: {
    number: {
      value:80,
      density: {
        enable: true,
        value_area: 500,
        }
      }
    }
}

const initialState = {
      input: '',
      imageURL: '',
      box: {},
      route: 'Signin',
      isSignedIn: false,
      user: {
        id: '',
        name: '',
        email:'',
        entries:0,
        joined: ''
      }
    }
  class App extends Component {
    constructor() {
      super();
      this.state = initialState;
    }

  loadUser = (data) => {
    this.setState({user: {
        id: data.id,
        name: data.name,
        email:data.email,
        entries:data.entries,
        joined: data.joined

    }})
  }

  calculateFaceLocation = (data) => {
    const clarifiaFace= data.outputs[0].data.regions[0].region_info.bounding_box;
    const image=document.getElementById('inputimage');
    const width = Number(image.width);
    const height= Number(image.height);
    return {
      leftCol: clarifiaFace.left_col * width,
      topRow: clarifiaFace.top_row * height,
      rightCol: width - (clarifiaFace.right_col * width),
      bottomRow: height - (clarifiaFace.bottom_row * height)
    }
  }

  displayFaceBox = (box) => {
    this.setState({box:box});
  }
  onInputChange =(event) => {
    this.setState({input:event.target.value})
  }

  onButtonSubmit = () => {
    this.setState({imageURL:this.state.input})
    fetch('http://localhost:3000/imageUrl', {
          method: 'post',
          headers: {'Content-Type': 'application/json'},
          body:JSON.stringify({
          input:this.state.input
      })
        })
        .then(response => response.json())
    .then(response =>{
      if(response) {
        fetch('http://localhost:3000/image', {
          method: 'put',
          headers: {'Content-Type': 'application/json'},
          body:JSON.stringify({
          id:this.state.user.id
      })
        })
        .then(response => response.json())
        .then(count => {
          this.setState(Object.assign(this.state.user, { entries:count}))
        })
        .catch(console.logz)
      }
      this.displayFaceBox(this.calculateFaceLocation(response))})
    .catch(err => console.log(err));
  }

  onRouteChange =(route) => {
    if (route ==='Signout') {
      this.setState(initialState)
    } else if (route === 'home') {
      this.setState({isSignedIn:true})
    }
    this.setState({route: route});
  }
  render() {
   const {isSignedIn, imageURL, route, box} = this.state;
    return (
      <div className='App'>
        <Particles className='particles'
              params={particlesOption}
              />
         <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange} />
        {route === 'home' 
        ?<div>
          <Logo />
        <Rank name={this.state.user.name} entries={this.state.user.entries}/>
      <ImageLinkForm 
          onInputChange={this.onInputChange} 
           onButtonSubmit= {this.onButtonSubmit}
      />
      <FaceRecognition box={box} imageURL={imageURL} />
      </div>
      :(
       route === 'Signin'
       ? <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
       : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
      )
        }
      </div>
    )
      }
      }

export default App;
