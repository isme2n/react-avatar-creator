import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import config from './config';

import Croppie from 'croppie'

import vision from "react-cloud-vision-api";
vision.init({ auth: config.API_KEY})

import a from './images/hair.png';

var charX = 245;
var charY = 185;
var ctx,canvas,avatar,actx;
class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      img : false
    }

    this.filter = this.filter.bind(this);
    this.restore = this.restore.bind(this);
  }
  componentDidMount() {
    canvas = this.refs.canvas;
    ctx = canvas.getContext('2d');
    avatar = this.refs.avatar;
    actx = avatar.getContext('2d');
  }

  drawImageData(image) {

    this.calcSize(image);

    ctx.drawImage(image, 0, (canvas.offsetHeight-image.height)/2, image.width, image.height);
  }

  calcSize(image){
    image.height *= canvas.offsetWidth / image.width;
    image.width = canvas.offsetWidth;

    if(image.height > canvas.offsetHeight){
        image.width *= canvas.offsetHeight / image.height;
        image.height = canvas.offsetHeight;
    }
  }

  redraw(data) {

    var x = charX;
    var y = charY;

    avatar.width = avatar.width; // clears the canvas
    var head = new Image();
    head.src = require("./images/circle-head.png");


    actx.drawImage(head, window.innerWidth/8 , 60);
    data[0].labelAnnotations.map((key,i)=>{
      console.log(key);
      if(key.description === 'glasses' || key.description === 'eyewear'){
        var glasses = new Image();
        glasses.src = require("./images/glasses.png");
        actx.drawImage(glasses, window.innerWidth/8+30, 126);
      }
      if(key.description.includes('hair')){
          var hair = new Image();
          hair.src = require("./images/brown-hair.png");
        if(key.description.includes('forehead')){
          hair = new Image();
      }
        if(key.description.includes('black')){
          hair = new Image();
          hair.src = require("./images/black-hair.png");
      }

      actx.drawImage(hair, window.innerWidth/8+30, 35);
    }
  })

  }

  imageLoad(e) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.setState({
      img:null
    });
    if(e.target.files.length === 1){
      var file = e.target.files[0];
      var fileReader = new FileReader();

      var self = this;
      fileReader.onload = function (e) {
          var image = new window.Image();
          image.src = e.target.result;

          const req = new vision.Request({
            image: new vision.Image({
              base64: e.target.result,
            }),
            features: [
              new vision.Feature('LABEL_DETECTION', 10),
            ]
          })

          // send single request
          vision.annotate(req).then((res) => {
            // handling response
            console.log(JSON.stringify(res.responses));
            self.redraw(res.responses);

          }, (e) => {
            console.log('Error: ', e)
          })
          self.setState({
            img : image
          })
          image.onload = function () {
              self.drawImageData(image);
          }
      };
      fileReader.readAsDataURL(file);}
    else{

    }
  }

  restore(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    this.calcSize(this.state.img);

    ctx.drawImage(this.state.img, 0, (canvas.offsetHeight-this.state.img.height)/2, this.state.img.width, this.state.img.height);
  }

  filter(func) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    this.calcSize(this.state.img);

    ctx.drawImage(this.state.img, 0, (canvas.offsetHeight-this.state.img.height)/2, this.state.img.width, this.state.img.height);
    // imageData를 가져온다.
    var pixels = ctx.getImageData(0,0, canvas.width, canvas.height);

    // image processing
    var filteredData = func(pixels);

    // Canvas에 다시 그린다.
    ctx.putImageData(filteredData, 0 , 0);
  }

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <h2>React Image Filter</h2>
        </div>
        <div>
          <div id="can"></div>

              <div id="canto"></div>
          <canvas id="canvas" ref="canvas" width={window.innerWidth/2} height={window.innerWidth/2}></canvas>
          <canvas id="canvas" ref="avatar" width={window.innerWidth/2} height={window.innerWidth/2}></canvas><br/>
          <input id="loadButton" onChange={this.imageLoad.bind(this)} type="file" accept="image/*"/>
          <button id="restoreButton" onClick={this.restore} disabled={this.state.img ? false : true}>원본보기</button>
        </div>
      </div>
    );
  }
}

export default App;
