(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Map=require("./map");$(function(){});
},{"./map":2}],2:[function(require,module,exports){
function Map(){}Map.prototype={tiledata:null,camera:null,scene:null,load:function(){},init:function(){this.scene=new THREE.Scene;var e=$("#gamescreen").width(),a=$("#gamescreen").height();switch(tiledata.properties.camera){case"ortho":this.camera=new THREE.OrthographicCamera(e/-2,e/2,a/2,a/-2,1,1e3),this.camera.position.y=100,this.camera.roation.x=-Math.PI/2;break;case"gen4":this.camera=new THREE.PerspectiveCamera(75,e/a,1,1e3),this.camera.position.y=10,this.camera.roation.x=-55*(Math.PI/180)}this.scene.add(this.camera)}};
},{}]},{},[1])


//# sourceMappingURL=_srcmaps/game.map.json