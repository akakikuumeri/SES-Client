(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports={
  "fps": 60,
  "container":"#game-container",
  "logLevel": 0,
  "debugMode":true,
  "physicsStepsPerUpdate":4,
  "physicsScale":16,
  "victoryTime":3200,
  "minSleepVel":0.1,
  "maxForce": 150,
  "renderer":{
    "options": {
      "antialias": true,
      "transparent": false
    },
    "size":{
      "x":960,
      "y":640
    }
  },
  "resourceLists":[
    "res/filelist.json"
  ],
  "staticResources":[
    "res/sprite/sprite.json",
    "res/sounds/sounds.json"
  ],
  "audioResources":[
    "res/sounds/sounds.json"
  ]
}

},{}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Entity = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ResourceManager = require('Managers/ResourceManager');

var _Log = require('Log');

var _InputManager = require('Managers/InputManager');

var _Scripts = require('Scripts/Scripts');

var _EventManager = require('Managers/EventManager');

var _config = require('config.json');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Entity = function (_PIXI$Container) {
  _inherits(Entity, _PIXI$Container);

  function Entity(data) {
    _classCallCheck(this, Entity);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Entity).call(this));

    _this.eventTypes = [];
    _this.events = [];
    _this.isActive = true;
    _this.tags = []; // Tags can be used to search and filter entities
    _this.scripts = [];
    return _this;
  }

  /**
   * Initializes
   * @param  {[Entity} rootEntity Topmost entity
   */


  _createClass(Entity, [{
    key: 'init',
    value: function init(rootEntity) {
      var _this2 = this;

      this.children.forEach(function (child) {
        if (child.init) child.init(rootEntity);
      });
      this.scripts.forEach(function (script) {
        script.init(_this2, rootEntity);
      });
      _EventManager.EventMan.registerListener(this);
    }

    /**
     * Handles events. Clears the list of events once they have been handled.
     */
    // TODO: Check if event is relevant to the script.

  }, {
    key: 'handleEvents',
    value: function handleEvents() {
      var _this3 = this;

      this.events.forEach(function (evt) {
        _this3.scripts.forEach(function (script) {
          script.handleGameEvent(_this3, evt);
        });
      });
      this.events = [];
    }

    /**
     * Finds the first entity with the given tag.
     * @param  {String} tag Tag to search for
     * @return {Entity}     Returns the first found entity, or nothing if not found
     */

  }, {
    key: 'findEntityWithTag',
    value: function findEntityWithTag(tag) {
      var indof = this.tags.indexOf(tag);
      if (indof >= 0) {
        return this;
      } else {
        for (var i = 0; i < this.children.length; i++) {
          var child = this.children[i];
          var found = void 0;
          if (child.findEntityWithTag) {
            found = child.findEntityWithTag(tag);
          }
          if (found) {
            return found;
          }
        }
      }
    }

    /**
     * Finds the first entity with the given name.
     * @param  {String} name Name to search for
     * @return {Entity}      Returns the first entity, or nothing if not found
     */

  }, {
    key: 'findEntityWithName',
    value: function findEntityWithName(name) {
      if (this.name === name) {
        return this;
      } else {
        for (var i = 0; i < this.children.length; i++) {
          var child = this.children[i];
          var found = void 0;
          if (child.findEntityWithName) {
            found = child.findEntityWithName(name);
          }
          if (found) {
            return found;
          }
        }
      }
    }

    /**
     * Turns a set of vertices into a format suitable for creating a Pixi polygon.
     * @param  {Array[Vec2]} vertices List of vertices
     * @param  {Vec2}        offset   An offset for all vertices
     * @return {Array[number]}        List of vertices as [x1, y1, x2, y2, ...]
     */

  }, {
    key: 'constructPixiPolygon',
    value: function constructPixiPolygon(vertices, offset) {
      var l = [];
      vertices.forEach(function (vertex) {
        l.push(vertex.x - offset.x);
        l.push(vertex.y - offset.y);
      });
      return l;
    }

    /**
     * Creates a box2D suitable list of vertices for creating a convex polygon.
     * @param  {Array[Vec2]} vertices List of vertices
     * @param  {Vec2}        offset   An offset for all vertices
     * @return {Array[b2Vec2]}        Converted list of vertices
     */

  }, {
    key: 'createBox2DVertices',
    value: function createBox2DVertices(vertices) {
      var offset = arguments.length <= 1 || arguments[1] === undefined ? { x: 0.0, y: 0.0 } : arguments[1];

      var verts = [];
      vertices.forEach(function (v) {
        var vec = new b2Vec2((v.x + offset.x) * 1.0 / _config2.default.physicsScale, (v.y + offset.y) * 1.0 / _config2.default.physicsScale);
        verts.push(vec);
      });
      return verts;
    }

    /**
     * Adds a script to the entity.
     * @param {String} scriptName The type of script to add
     * @param {Object} parameters Parameters that are passed to the script
     *                            constructor
     */
    // TODO: Remove duplicate event types (keep only topmost)

  }, {
    key: 'addScript',
    value: function addScript(scriptName, parameters) {
      var _this4 = this;

      var script = new _Scripts.Scripts[scriptName](parameters);
      this.scripts.push(script);
      var eventTypes = script.eventTypes;
      eventTypes.forEach(function (eventType) {
        _this4.eventTypes.push(eventType);
      });
    }

    /**
     * Adds an event
     */

  }, {
    key: 'addEvent',
    value: function addEvent(evt) {
      this.events.push(evt);
    }

    /**
     * Adds a rectangle graphic to entity.
     * @param {number} color  An rgb color (hex)
     * @param {number} width  Width of box
     * @param {number} height Height of box
     */

  }, {
    key: 'addBox',
    value: function addBox(color, width, height) {
      var graphics = new PIXI.Graphics();
      graphics.beginFill(color);
      graphics.drawRect(0, 0, width, height);
      graphics.pivot = {
        x: width / 2,
        y: height / 2
      };

      this.addChild(graphics);
    }
    /**
     * Adds a circle graphic to entity.
     * @param {number} color  An rgb color (hex)
     * @param {number} radius Radius of circle
     */

  }, {
    key: 'addCircle',
    value: function addCircle(color, radius) {
      var graphics = new PIXI.Graphics();
      graphics.beginFill(color);
      graphics.drawCircle(0, 0, radius);

      this.addChild(graphics);
    }

    /**
     * Adds a polygon graphic to entity
     * @param {[type]} color    An rgb color (hex)
     * @param {[type]} vertices A list of vertices that define the polygon (CCW
     *                          winding).
     */

  }, {
    key: 'addPolygon',
    value: function addPolygon(color, vertices) {
      var graphics = new PIXI.Graphics();
      graphics.beginFill(color);
      graphics.drawPolygon(this.constructPixiPolygon(vertices, { x: 0, y: 0 }));

      this.addChild(graphics);
    }

    /**
     * Adds a sprite to entity
     * @param {String} spriteName Name of sprite to add (filename without path or
     *                            extension).
     */

  }, {
    key: 'setSprite',
    value: function setSprite(spriteName) {
      if (!this.sprite) {
        this.sprite = new PIXI.Sprite();
        this.sprite.anchor = {
          x: 0.5,
          y: 0.5
        };
        this.addChild(this.sprite);
      }
      this.sprite.texture = _ResourceManager.resources.sprite.textures[spriteName];
    }

    /**
     * Adds body and fixture definitions to the entity. A body and fixture are
     * created on the next physics update.
     * @param {String)} bodyType Type of body to add (circle, rectangle, polygon)
     * @param {Object}  options  Any physics options to use to build body and
     *                           fixture definitions.
     */

  }, {
    key: 'addPhysics',
    value: function addPhysics(bodyType) {
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var bodyDef = new b2BodyDef();
      var fixDef = new b2FixtureDef();
      var width = options.width;
      var height = options.height;
      var radius = width / 2.0;
      var x = options.x;
      var y = options.y;
      var pos = new Box2D.b2Vec2(options.x / _config2.default.physicsScale, options.y / _config2.default.physicsScale);
      var shape = {};

      switch (bodyType) {
        case 'circle':
          shape = new b2CircleShape(radius);
          shape.set_m_radius(radius / _config2.default.physicsScale);
          if (options.render) {
            this.addCircle(this.collider_color, width / 2);
          }
          break;
        case 'rectangle':
          shape = new b2PolygonShape();
          shape.SetAsBox(width / _config2.default.physicsScale / 2, height / _config2.default.physicsScale / 2);
          if (options.render) {
            this.addBox(this.collider_color, width, height);
          }
          break;
        case 'polygon':
          var verts = this.createBox2DVertices(options.polygon);
          shape = createPolygonShape(verts);
          if (options.render) {
            this.addPolygon(this.collider_color, options.polygon);
          }
          break;
      }
      if (options.treatment !== 'static') {
        bodyDef.set_type(Box2D.b2_dynamicBody);
        bodyDef.set_linearDamping(options.damping || 0.0);
        bodyDef.set_angularDamping(options.angularDamping || 0.1);
      }
      bodyDef.set_position(pos);

      fixDef.set_density(options.density || 1.0);
      fixDef.set_friction(options.friction || 0.5);
      fixDef.set_restitution(options.restitution || 0.2);
      fixDef.set_shape(shape);
      if (options.collisionFilter) {
        fixDef.set_filter(1);
      }

      this.physics = {
        inWorld: false,
        bodyDef: bodyDef,
        fixDef: fixDef
      };
    }

    /*
      Unpacks entity from configuration file. Loads config
      Config format:
        - component_data
          - Will go straight to entity.
            Useful when defining components that dont need their own config files
        - component_configuration
          - Holds a handle for config file that holds the actual data.
            Useful when actual component data is in another file. Like animations.
      Create entity with this and see its structure for more info.
    */

  }], [{
    key: 'fromConfig',
    value: function fromConfig(configName) {
      return Entity.fromConfigObj(_ResourceManager.resources[configName].data);
    }
  }, {
    key: 'fromConfigObj',
    value: function fromConfigObj(config) {
      var ent = new Entity();

      // Assign component_data to entity
      Object.assign(ent, config.component_data);

      // Get each component_configuration and set them to entity
      var compConf = config.component_configuration;
      Object.keys(compConf).forEach(function (key) {
        ent[key] = _ResourceManager.resources[compConf[key]].data;
      });

      var physics = config.physics;
      if (physics) {
        ent.addPhysics(physics.bodyType, physics.options);
      } else {
        if (config.position) {
          ent.position = config.position;
        }
        // ent.position.x = config.position.x;
        // log.debug(ent.position);
      }

      if (config.sprite) {
        ent.setSprite(config.sprite);
      }

      var scriptConf = config.scripts;
      scriptConf.forEach(function (conf) {
        var name = conf.name;
        var params = conf.parameters || {};
        ent.addScript(name, params);
      });
      return ent;
    }

    /**
     * Converts a tiled object into an entity
     * @param  {Object} tiledObj Tiled object (from JSON)
     * @return {Entity}          The created entity
     */

  }, {
    key: 'fromTiledObject',
    value: function fromTiledObject(tiledObj) {
      var props = tiledObj.properties;
      var config = _ResourceManager.resources[props.config].data;

      Object.assign(config.component_data, tiledObj.properties);

      config.component_data.name = tiledObj.name;

      config.position = {
        x: tiledObj.x + tiledObj.width / 2,
        y: tiledObj.y + tiledObj.height / 2
      };

      if (config.physics) {
        config.physics.options.x = tiledObj.x + tiledObj.width / 2;
        config.physics.options.y = tiledObj.y + tiledObj.height / 2;
        config.physics.options.width = tiledObj.width;
        config.physics.options.height = tiledObj.height;
        config.physics.options.radius = tiledObj.width / 2;
        if (tiledObj.polygon) {
          config.physics.options.polygon = tiledObj.polygon;
        }
      }

      var ent = Entity.fromConfigObj(config);
      return ent;
    }
  }]);

  return Entity;
}(PIXI.Container);

exports.Entity = Entity;

},{"Log":4,"Managers/EventManager":8,"Managers/InputManager":9,"Managers/ResourceManager":10,"Scripts/Scripts":19,"config.json":1}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Game = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Log = require('Log');

var _ScriptSystem = require('Systems/ScriptSystem');

var _EventSystem = require('Systems/EventSystem');

var _PhysicsSystem = require('Systems/PhysicsSystem');

var _Entity = require('Entity');

var _Scripts = require('Scripts/Scripts');

var _EventManager = require('Managers/EventManager');

var _ResourceManager = require('Managers/ResourceManager');

var _config = require('config.json');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Game = function () {
  function Game() {
    var _this = this;

    _classCallCheck(this, Game);

    // The stage is the topmost container for all of the game's entities
    this.stage = new _Entity.Entity();
    // The world represents the game world
    this.world = new _Entity.Entity.fromConfig('entity_world');
    // The UI consists of unmoving entities
    this.ui = new _Entity.Entity(); //new Entity('entity_ui');

    this.stage.addChild(this.ui);
    this.stage.addChild(this.world);

    // Add systems
    this.systems = [];
    var physicsSystem = new _PhysicsSystem.PhysicsSystem();
    this.systems.push(physicsSystem);

    var scriptSystem = new _ScriptSystem.ScriptSystem();
    this.systems.push(scriptSystem);

    var eventSystem = new _EventSystem.EventSystem();
    this.systems.push(eventSystem);

    // Load level
    this.addEntityToWorld(this.loadMap('testmap'));
    // if (cfg.debugMode) this.debugConstructor();

    // Initialize all entities
    this.stage.init(this.stage);
    // Initialize all systems
    this.systems.forEach(function (system) {
      system.init(_this.stage);
    });
  }

  /**
   * Method for creating and adding test entities to the game.
   */


  _createClass(Game, [{
    key: 'debugConstructor',
    value: function debugConstructor() {
      // this.addEntityToWorld(this.loadMap('testmap'));
      _Log.log.debug("Starting debug constructor");
      var testEntity = _Entity.Entity.fromConfig('entity_player');
      _Log.log.debug("Created from config");
      testEntity.setSprite('debug_2');
      testEntity.addScript('inputScript', { a: 'b', c: 'd' });
      _Log.log.debug("Added script");
      testEntity.addPhysics('rectangle', {
        x: 0,
        y: 0,
        vx: 0.01,
        width: 64,
        height: 64
      });
      _Log.log.debug("Added physics");
      _Log.log.debug(testEntity);
      this.addEntityToWorld(testEntity);
    }

    /**
     * Adds an entity to the game world
     * @param {Entity} entity The entity to add
     */

  }, {
    key: 'addEntityToWorld',
    value: function addEntityToWorld(entity) {
      this.world.addChild(entity);
    }

    /**
     * Adds an entity to the UI
     * @param {Entity} entity The entity to add
     */

  }, {
    key: 'addEntityToUI',
    value: function addEntityToUI(entity) {
      this.ui.addChild(entity);
    }

    /**
     * Runs all entities through all systems.
     * @param  {number} delta Time since last update
     */

  }, {
    key: 'update',
    value: function update(delta) {
      var _this2 = this;

      this.systems.forEach(function (system) {
        system.update(_this2.world, delta);
        system.update(_this2.ui, delta);
      });
    }

    /**
     * Renders all renderable entities.
     */

  }, {
    key: 'render',
    value: function render(renderer) {
      this.stage.scale.x = _config2.default.widthScale;
      this.stage.scale.y = _config2.default.widthScale;
      // log.debug(cfg.widthScale);
      renderer.render(this.stage);
    }

    /**
     * Loads a Tiled map into the game world and ui
     *
     * @param  {String} mapname Name of the map (without path or extension)
     */

  }, {
    key: 'loadMap',
    value: function loadMap(mapname) {
      console.log(_ResourceManager.resources);
      // let a = resources[mapname].data.properties.config
      // console.log(a);
      var eMap = new _Entity.Entity(); //Entity.fromConfig(a);
      _Log.log.debug(mapname);
      _ResourceManager.resources[mapname].data.layers.forEach(function (layer) {
        var eLayer = new _Entity.Entity();
        // console.log(layer);
        if (layer.type === 'imagelayer') {
          var imagename = layer.image.split('.')[0];
          var sprite = new PIXI.Sprite();
          sprite.texture = _ResourceManager.resources[imagename].texture;
          eLayer.position.x = layer.offsetx || 0;
          eLayer.position.y = layer.offsety || 0;
          eLayer.addChild(sprite);
        } else if (layer.type === 'objectgroup') {
          layer.objects.forEach(function (obj) {
            var eObj = _Entity.Entity.fromTiledObject(obj);
            eLayer.addChild(eObj);
          });
        }
        eMap.addChild(eLayer);
      });
      _Log.log.debug(eMap);
      return eMap;
    }
  }]);

  return Game;
}();

exports.Game = Game;

},{"Entity":2,"Log":4,"Managers/EventManager":8,"Managers/ResourceManager":10,"Scripts/Scripts":19,"Systems/EventSystem":21,"Systems/PhysicsSystem":22,"Systems/ScriptSystem":23,"config.json":1}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.log = undefined;

var _config = require('config.json');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * This is a utility file for logging.
 */

var levels = new Map([[1, ['DEBUG', 'color: #22AA22;']], [2, ['INFO ', 'color: #2222AA;']], [3, ['WARN ', 'color: #CC8822;']], [4, ['ERROR', 'color: #DD4422;']], [5, ['FATAL', 'color: #FF0000;']]]);

function print() {
  var msg = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
  var level = arguments.length <= 1 || arguments[1] === undefined ? 1 : arguments[1];

  level = Math.max(1, Math.min(5, level));
  if (level >= _config2.default.logLevel) {
    var prop = levels.get(level);
    console.log('%c[' + prop[0] + ']:', prop[1], msg);
  }
}

var log = {
  debug: function debug(msg) {
    print(msg, 1);
  },
  info: function info(msg) {
    print(msg, 2);
  },
  warn: function warn(msg) {
    print(msg, 3);
  },
  error: function error(msg) {
    print(msg, 4);
  },
  fatal: function fatal(msg) {
    print(msg, 5);
  },
  print: print,
  test: test
};

function test() {
  log.debug('debug msg');
  log.info('info msg');
  log.warn('warn msg');
  log.error('error msg');
  log.fatal('fatal msg');
}
exports.log = log;

},{"config.json":1}],5:[function(require,module,exports){
'use strict';

var _InputManager = require('Managers/InputManager');

var _EventManager = require('Managers/EventManager');

var _AudioManager = require('Managers/AudioManager');

var _ResourceManager = require('Managers/ResourceManager');

var _Scripts = require('Scripts/Scripts');

var _Entity = require('Entity');

var _Game = require('Game');

var _Log = require('Log');

var _config = require('config.json');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var $ = jQuery;

$(document).ready(function () {
  var el = $(_config2.default.container);

  // Pixi setup
  PIXI.utils._saidHello = true; // Keep console clean
  // PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST;

  // Renderer
  var redOpt = _config2.default.renderer.options;
  redOpt.resolution = window.devicePixelRatio || 1;
  _config2.default.resolution = window.devicePixelRatio || 1;
  var ratio = _config2.default.renderer.size.y / _config2.default.renderer.size.x;
  _config2.default.widthScale = el.width() / _config2.default.renderer.size.x / redOpt.resolution;
  _config2.default.inputRes = el.width() / _config2.default.renderer.size.x;

  var renderer = PIXI.autoDetectRenderer(el.width() / redOpt.resolution, el.width() * ratio / redOpt.resolution, redOpt);
  renderer.backgroundColor = 0x000000;

  // Managers
  /* TODO: Figure out way to prioritize manager init.
  Now resman init is called before anything else manually.
  Luckily, resman does not need to update itself. */
  var managers = [_InputManager.InputMan, _EventManager.EventMan, _AudioManager.AudioMan];

  // Stage
  var game = void 0;

  // Delta time for each update
  var loopInterval = 1000 / _config2.default.fps;
  var lastFrame = 0;

  // Main entry
  function main() {
    _Log.log.info('Target fps: ' + _config2.default.fps);
    el.append(renderer.view);

    _ResourceManager.ResourceMan.init().then(function () {
      var manPromises = managers.map(function (man) {
        return man.init();
      });

      Promise.all(manPromises).then(function (values) {
        managers.forEach(function (man) {
          _EventManager.EventMan.registerListener(man);
        });
        // All manger inits are done, start the game!
        initReady();
      });
    });
  }

  // Run once resources have initialized
  function initReady() {
    _Log.log.info('Initialization ready!');
    //console.clear(); // Clears the console.
    game = new _Game.Game();
    requestAnimationFrame(loop);
  }

  var delta = 0;
  function loop(ctime) {
    delta += ctime - lastFrame;

    // Use count to limit number of accumulated frames
    var count = 0;
    while (delta > loopInterval && count < 3) {
      count++;
      update(loopInterval);
      delta -= loopInterval;
      draw();
      managers.forEach(function (man) {
        man.update();
      });
    }
    if (count == 3) {
      delta = 0;
    }
    lastFrame = ctime;

    // if(ctime - lastFrame > loopInterval) {
    //   lastFrame = ctime;
    //   update(delta);
    //   draw();
    //   Input.update();
    //   EventManager.delegateEvents();
    // }
    requestAnimationFrame(loop);
  }

  function update(delta) {
    game.update(delta);
  }

  function draw() {
    game.render(renderer);
  }

  // Scale game view as window changes size
  $(window).resize(function () {
    _config2.default.widthScale = el.width() / _config2.default.renderer.size.x / redOpt.resolution;
    renderer.resize(el.width() / redOpt.resolution, el.width() * ratio / redOpt.resolution);
  });

  main();
});

},{"Entity":2,"Game":3,"Log":4,"Managers/AudioManager":7,"Managers/EventManager":8,"Managers/InputManager":9,"Managers/ResourceManager":10,"Scripts/Scripts":19,"config.json":1}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Parent class for managers. Managers can be used to 'manage' any system-wide
 * resources. For example the event manager collects and distributes events to
 * any registered listeners. The resource manager facilitates the loading and
 * use of external resources. 
 */

var Manager = function () {
  function Manager() {
    _classCallCheck(this, Manager);

    this.eventTypes = [];
    this.events = [];
  }

  // Run at game init. Returns promise.


  _createClass(Manager, [{
    key: 'init',
    value: function init() {
      var promise = new Promise(function (resolve, reject) {
        resolve('Default manager init done!');
      });

      return promise;
    }

    // Run each frame.

  }, {
    key: 'update',
    value: function update() {
      this.handleEvents();
    }
  }, {
    key: 'addEvent',
    value: function addEvent(evt) {
      this.events.push(evt);
    }
  }, {
    key: 'handleEvents',
    value: function handleEvents() {
      var _this = this;

      this.events.forEach(function (evt) {
        _this.handleSingleEvent(evt);
      });
      this.events = [];
    }
  }, {
    key: 'handleSingleEvent',
    value: function handleSingleEvent(evt) {}
  }]);

  return Manager;
}();

exports.Manager = Manager;

},{}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AudioMan = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Log = require('Log');

var _ResourceManager = require('Managers/ResourceManager');

var _config = require('config.json');

var _config2 = _interopRequireDefault(_config);

var _Manager2 = require('Manager');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AudioManager = function (_Manager) {
  _inherits(AudioManager, _Manager);

  function AudioManager() {
    _classCallCheck(this, AudioManager);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(AudioManager).call(this));

    _this.eventTypes = ['audio'];
    _this.musicid = -1;
    _this.soundid = -1;
    return _this;
  }

  _createClass(AudioManager, [{
    key: 'init',
    value: function init() {
      var _this2 = this;

      var promise = new Promise(function (resolve, reject) {
        var soundConfig = _ResourceManager.resources.sounds.data;

        var ready = function ready() {
          resolve('Audio manager init done!');
        };
        // Paths are just filenames. This adds rest of the path
        var fixedUrls = soundConfig.urls.map(function (e) {
          return 'res/sounds/' + e;
        });
        _this2.howl = new Howl({
          src: fixedUrls,
          sprite: soundConfig.sprite,
          // html5: true,
          preload: true,
          onload: ready
        });
      });

      return promise;
    }
  }, {
    key: 'handleSingleEvent',
    value: function handleSingleEvent(evt) {
      var spriteName = evt.parameters.audio;

      if (evt.eventType == 'audio_sound_play') {
        if (this.soundid >= 0) {
          this.howl.stop(this.soundid);
        }
        this.soundid = this.howl.play(spriteName);
      } else if (evt.eventType == 'audio_music_play') {
        if (this.musicid >= 0) {
          this.howl.stop(this.musicid);
        }
        this.musicid = this.howl.play(spriteName);
      }
    }
  }]);

  return AudioManager;
}(_Manager2.Manager);

var AudioMan = new AudioManager();

exports.AudioMan = AudioMan;

},{"Log":4,"Manager":6,"Managers/ResourceManager":10,"config.json":1}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EventMan = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Log = require('Log');

var _Manager2 = require('Manager');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var EventManager = function (_Manager) {
  _inherits(EventManager, _Manager);

  function EventManager() {
    _classCallCheck(this, EventManager);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(EventManager).call(this));

    _this.listeners = {
      listeners: []
    };
    _this.events = [];
    return _this;
  }

  // TODO: Test optimizeEventTypes method


  _createClass(EventManager, [{
    key: 'optimizeEventTypes',
    value: function optimizeEventTypes(eventTypes) {
      var results = [];
      if (eventTypes.length > 0) {
        var sorted = eventTypes.sort();
        var check = sorted[0];
        results.push(check);
        for (var i = 1; i < sorted.length; i++) {
          var other = sorted[i];
          var subs = other.substr(0, check.length);
          if (subs !== check) {
            check = other;
            results.push(check);
          }
        }
      }
      return results;
    }
  }, {
    key: 'registerListener',
    value: function registerListener(listener) {
      var _this2 = this;

      var eventTypes = this.optimizeEventTypes(listener.eventTypes);
      eventTypes.forEach(function (eventType) {
        var s = eventType.split('_');
        var root = _this2.listeners;
        for (var i = 0; i < s.length; i++) {
          var key = s[i];
          if (!root[key]) {
            root[key] = {
              listeners: []
            };
          }
          root = root[key];
        }
        root.listeners.push(listener);
      });
    }
  }, {
    key: 'publish',
    value: function publish(event) {
      this.events.push(event);
    }
  }, {
    key: 'update',
    value: function update() {
      this.delegateEvents();
    }
  }, {
    key: 'delegateEvents',
    value: function delegateEvents() {
      var _this3 = this;

      this.events.forEach(function (event) {
        var eventType = event.eventType;
        var s = eventType.split('_');
        var root = _this3.listeners;
        root.listeners.forEach(function (listener) {
          return listener.addEvent(event);
        });

        var addEvent = function addEvent(listener) {
          return listener.addEvent(event);
        };
        for (var i = 0; i < s.length; i++) {
          var key = s[i];
          if (!root[key]) {
            break;
          }
          root = root[key];
          root.listeners.forEach(addEvent);
        }
      });
      this.events = [];
    }

    // TODO: Implement removeListener in EventManager

  }, {
    key: 'removeListener',
    value: function removeListener() {
      throw new Error('Remove Listener not implemented!');
    }
  }]);

  return EventManager;
}(_Manager2.Manager);

var EventMan = new EventManager();

exports.EventMan = EventMan;

},{"Log":4,"Manager":6}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.InputMan = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _keys = require('keys.json');

var _keys2 = _interopRequireDefault(_keys);

var _Manager2 = require('Manager');

var _config = require('config.json');

var _config2 = _interopRequireDefault(_config);

var _Log = require('Log');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var $ = jQuery;

var InputManager = function (_Manager) {
  _inherits(InputManager, _Manager);

  function InputManager() {
    _classCallCheck(this, InputManager);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(InputManager).call(this));

    _this.keyDown = {};
    _this.keyPressed = {};
    _this.keyReleased = {};
    _this.mousePos = { x: 0, y: 0 };
    _this.mousePressed = false;
    _this.mouseReleased = false;
    return _this;
  }

  _createClass(InputManager, [{
    key: 'init',
    value: function init() {
      var _this2 = this;

      this.el = $(_config2.default.container);
      var promise = new Promise(function (resolve, reject) {

        _this2.keys = new Map(Object.keys(_keys2.default).map(function (key) {
          return [_keys2.default[key], key];
        }));

        var canvas = _this2.el[0];

        window.addEventListener('keydown', function (e) {
          return _this2.setKeyState(e, true);
        }, false);
        window.addEventListener('keyup', function (e) {
          return _this2.setKeyState(e, false);
        }, false);
        jQuery(window).mousedown(function (e) {
          return _this2.setMouseState(e, true);
        });
        jQuery(window).mouseup(function (e) {
          return _this2.setMouseState(e, false);
        });
        jQuery(window).on("touchstart", function (e) {
          _this2.setMouseStateTouch(e, true);
        });
        jQuery(window).on("touchmove", function (e) {
          _this2.setCursorPosTouch(e);
        });
        jQuery(window).on("touchend", function (e) {
          return _this2.setMouseState(e, false);
        });
        jQuery(window).bind('mousemove', function (e) {
          return _this2.setCursorPos(e);
        });

        resolve('Input manager init done!');
      });
      this.el = $(_config2.default.container);
    }
  }, {
    key: 'setKeyState',
    value: function setKeyState(ev, state) {
      var code = ev.which;
      var key = this.keys.get(code);
      if (key) ev.preventDefault();
      if (this.keyDown[key] != state) {
        this.keyDown[key] = state;
        if (state) {
          this.keyPressed[key] = true;
        } else {
          this.keyReleased[key] = true;
        }
      }
    }
  }, {
    key: 'setMouseState',
    value: function setMouseState(ev, state) {
      if (this.mouseDown != state) {
        this.mouseDown = state;
      }
      if (state) {
        this.mousePressed = true;
      } else {
        this.mouseReleased = true;
      }
    }
  }, {
    key: 'setMouseStateTouch',
    value: function setMouseStateTouch(ev, state) {
      if (this.mouseDown != state) {
        this.mouseDown = state;
      }
      this.setCursorPosTouch(ev);
      if (state) {
        this.mousePressed = true;
      } else {
        this.mouseReleased = true;
      }
    }
  }, {
    key: 'setCursorPos',
    value: function setCursorPos(ev) {
      var off = this.el.offset();
      var s = _config2.default.inputRes;
      this.mousePos = {
        x: ev.pageX / s - off.left,
        y: ev.pageY / s - off.top
      };
    }
  }, {
    key: 'setCursorPosTouch',
    value: function setCursorPosTouch(ev) {
      var off = this.el.offset();
      var s = _config2.default.inputRes;
      var origEvent = ev.originalEvent;
      this.mousePos = {
        x: origEvent.targetTouches[0].pageX / s - off.left,
        y: origEvent.targetTouches[0].pageY / s - off.top
      };
    }
  }, {
    key: 'update',
    value: function update() {
      /*TODO: Ensure input stays constant throughout game update.
      Keydown and keyup events will trigger even when game is updating.*/
      this.keyPressed = {};
      this.keyReleased = {};
      this.mousePressed = false;
      this.mouseReleased = false;
    }
  }]);

  return InputManager;
}(_Manager2.Manager);

var InputMan = new InputManager();

exports.InputMan = InputMan;

},{"Log":4,"Manager":6,"config.json":1,"keys.json":25}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.resources = exports.ResourceMan = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Log = require('Log');

var _config = require('config.json');

var _config2 = _interopRequireDefault(_config);

var _Manager2 = require('Manager');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ResourceManager = function (_Manager) {
  _inherits(ResourceManager, _Manager);

  function ResourceManager() {
    _classCallCheck(this, ResourceManager);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ResourceManager).call(this));

    _this.loadBarLen = 10;
    _this.loader = PIXI.loader;
    _this.resources = _this.loader.resources;
    return _this;
  }

  _createClass(ResourceManager, [{
    key: 'init',
    value: function init() {
      var _this2 = this;

      var promise = new Promise(function (resolve, reject) {
        var ready = function ready() {
          resolve('Resource manager init done!');
        };

        var error = function error(a, b, c) {
          _Log.log.error(a);
          _Log.log.error(b);
          _Log.log.error(c);
          reject('Resource manager init ERROR!');
        };
        var filelistLoader = new PIXI.loaders.Loader();

        Object.keys(_config2.default.resourceLists).forEach(function (key) {
          filelistLoader.add(_config2.default.resourceLists[key]);
        });

        filelistLoader.on('progress', function (a, b) {
          return _this2.loadProgress(a, b, 'Filelist');
        });
        filelistLoader.on('error', error);

        filelistLoader.once('complete', function (ldr, res) {

          Object.keys(res).forEach(function (key) {
            res[key].data.forEach(function (path) {
              _this2.loader.add(_this2.getName(path), path);
            });
          });

          _config2.default.staticResources.forEach(function (path) {
            _this2.loader.add(_this2.getName(path), path);
          });

          _this2.loader.on('progress', function (a, b) {
            return _this2.loadProgress(a, b, 'Resource');
          });
          _this2.loader.on('error', error);
          _this2.loader.once('complete', ready);
          _this2.loader.load();
        });
        filelistLoader.load();
      });

      return promise;
    }
  }, {
    key: 'getName',
    value: function getName(path) {
      return path.split('\\').pop().split('/').pop().split('.')[0];
    }
  }, {
    key: 'loadProgress',
    value: function loadProgress(ldr, res, header) {
      var p = ldr.progress;
      var ready = Math.floor(this.loadBarLen * (Math.floor(p) / 100));
      var i = '='.repeat(ready) + ' '.repeat(this.loadBarLen - ready);
      var str = header + ' progress [' + i + '] ' + Math.floor(p) + '%';
      _Log.log.info(str);
    }
  }]);

  return ResourceManager;
}(_Manager2.Manager);

var ResourceMan = new ResourceManager();
var res = ResourceMan.resources;

exports.ResourceMan = ResourceMan;
exports.resources = res;

},{"Log":4,"Manager":6,"config.json":1}],11:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Script = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Log = require('Log');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * A script is a behaviour that can be attached to an entity. This class should
 * be extended. The most common usage for scripts is to add specific behaviours
 * to a small subset of entities.
 */

var Script = function () {
  /**
   * Initialized script.
   *
   * @param  {Object} parameters Any parameters tha a script needs. All parameters
   *                             are copied to object properties.
   */

  function Script(parameters) {
    _classCallCheck(this, Script);

    // Copy parameters to this object
    var a = {};
    jQuery.extend(true, a, parameters);
    Object.assign(this, a);

    // Initialize empty list of event types
    this.eventTypes = [];
  }

  /**
   * Once an entity has been created, this init is run. Useful for creating more
   * performant scripts: if a script needs to reference another entity, this
   * entity can be searched and stored for access in the update function.
   *
   * @param  {Entity} parent     The owner of the script.
   * @param  {Entity} rootEntity The topmost entity for which the ScriptSystem is
   *                             run.
   */


  _createClass(Script, [{
    key: 'init',
    value: function init(parent, rootEntity) {}

    /**
     * Run once per game update.
     *
     * @param  {Entity} parent     The owner of the script.
     * @param  {Entity} rootEntity The topmost entity for which the ScriptSystem is
     *                             run.
     * @param  {number} delta      Time since last update.
     */

  }, {
    key: 'update',
    value: function update(parent, rootEntity, delta) {}

    /**
     * Run after the main update has been run for all entities.
     *
     * @param  {Entity} parent     The owner of the script.
     * @param  {Entity} rootEntity The topmost entity for which the ScriptSystem is
     *                             run.
     * @param  {number} delta      Time since last update.
     */

  }, {
    key: 'lateUpdate',
    value: function lateUpdate(parent, rootEntity, delta) {}

    /**
     * Handles events relevant to the script.
     * @param  {[type]} parent The owner of the script.
     * @param  {[type]} evt    The event to handle.
     */

  }, {
    key: 'handleGameEvent',
    value: function handleGameEvent(parent, evt) {}
  }]);

  return Script;
}();

exports.Script = Script;

},{"Log":4}],12:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AnimationScript = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Log = require('Log');

var _Script2 = require('Script');

var _InputManager = require('Managers/InputManager');

var _EventManager = require('Managers/EventManager');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AnimationScript = function (_Script) {
  _inherits(AnimationScript, _Script);

  function AnimationScript(parameters) {
    _classCallCheck(this, AnimationScript);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(AnimationScript).call(this, parameters));

    _this.eventTypes.push('animation_test');
    _this.timeAtCurrentFrame = -1;
    _this.currentFrame = 0;
    return _this;
  }

  _createClass(AnimationScript, [{
    key: 'init',
    value: function init(rootEntity) {
      _Log.log.debug('anim script init');
    }
  }, {
    key: 'update',
    value: function update(parent, rootEntity, delta) {
      var anim = parent.animation;

      if (anim) {
        var frames = anim.anim;

        if (this.timeAtCurrentFrame > frames[this.currentFrame].duration || this.timeAtCurrentFrame === -1) {
          // Change current frame
          var newFrame = (this.currentFrame + 1) % frames.length;
          this.currentFrame = newFrame;
          parent.setSprite(frames[this.currentFrame].frame);
          this.timeAtCurrentFrame = 0;
        } else {
          this.timeAtCurrentFrame += delta;
        }
      } else {
        _Log.log.warn('Animation script needs animation component to work');
      }
    }
  }, {
    key: 'handleGameEvent',
    value: function handleGameEvent(parent, evt) {
      _Log.log.debug('Anim script: ' + evt.parameters.message);
    }
  }]);

  return AnimationScript;
}(_Script2.Script);

exports.AnimationScript = AnimationScript;

},{"Log":4,"Managers/EventManager":8,"Managers/InputManager":9,"Script":11}],13:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ForceInputScript = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Log = require('Log');

var _Script2 = require('Script');

var _InputManager = require('Managers/InputManager');

var _EventManager = require('Managers/EventManager');

var _ResourceManager = require('Managers/ResourceManager');

var _Entity = require('Entity');

var _config = require('config.json');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ForceInputScript = function (_Script) {
  _inherits(ForceInputScript, _Script);

  function ForceInputScript(parameters) {
    _classCallCheck(this, ForceInputScript);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ForceInputScript).call(this, parameters));

    _this.team = parameters.team;
    _this.eventTypes.push('input_test', 'turn', 'play_turn');
    _this.team = parameters.team;
    _this.inputting = false;
    _this.myTurn = false;
    return _this;
  }

  _createClass(ForceInputScript, [{
    key: 'init',
    value: function init(parent, rootEntity) {
      this.arrowSprite = new PIXI.Sprite();
      this.arrowSprite.pivot = { x: 512, y: 128 };
      this.arrowSprite.anchor = {
        x: 0,
        y: 0
      };
      this.arrowSprite.texture = _ResourceManager.resources.sprite.textures['arrow'];
      parent.addChild(this.arrowSprite);
      this.arrowSprite.scale = { x: 0.0, y: 0.1 };
      // this.arrowEntity = Entity.fromConfig('entity_force_arrow');
      // log.debug(this.arrowEntity);
      // parent.children.push(this.arrowEntity);
      // parent.setSprite('debug_2');
    }
  }, {
    key: 'testCollision',
    value: function testCollision(parent, point) {
      if (parent.physics) {
        var bod = parent.physics.body;
        var fixtures = bod.GetFixtureList();
        var fix = parent.physics.fixture;
        var p = new b2Vec2(point.x / _config2.default.physicsScale, point.y / _config2.default.physicsScale);
        var pos = bod.GetPosition();
        var t = fixtures.TestPoint(p);
        return t;
        //  return (fix.TestPoint(p));
        // return Matter.Bounds.contains(bod.bounds, point) && Matter.Vertices.contains(bod.vertices, point);
      } else {
          // TODO
          return false;
        }
    }
  }, {
    key: 'length',
    value: function length(x, y) {
      return Math.sqrt(x * x + y * y);
    }
  }, {
    key: 'update',
    value: function update(parent, rootEntity, delta) {
      if (this.myTurn) {
        var pos = _InputManager.InputMan.mousePos;
        if (parent.physics) {
          var bod = parent.physics.body;
          if (_InputManager.InputMan.mousePressed && this.testCollision(parent, pos)) {
            this.inputting = true;
          } else if (_InputManager.InputMan.mouseReleased && this.inputting) {
            var bodPos = bod.GetPosition();
            var bPos = {
              x: bodPos.get_x() * _config2.default.physicsScale,
              y: bodPos.get_y() * _config2.default.physicsScale
            };
            this.inputting = false;
            var difX = bPos.x - pos.x;
            var difY = bPos.y - pos.y;

            var l = this.length(difX, difY);
            difX /= l;
            difY /= l;

            l = Math.min(_config2.default.maxForce, l);

            difX *= l;
            difY *= l;

            bod.ApplyLinearImpulse(new b2Vec2(difX, difY), bod.GetWorldCenter(), true);
            this.myTurn = false;
            parent.alpha = 0.5;
            this.arrowSprite.position.x += difX;
            this.arrowSprite.position.y += difY;
            _EventManager.EventMan.publish({
              eventType: this.team + '_move',
              parameters: {}
            });
            // Matter.Body.applyForce(bod, bodPos, {x: difX / 500.0, y: difY / 500.0});
          } else if (this.inputting) {
              this.arrowSprite.position = {
                x: 0,
                y: 0
              };
              var _bodPos = bod.GetPosition();
              var _bPos = {
                x: _bodPos.get_x() * _config2.default.physicsScale,
                y: _bodPos.get_y() * _config2.default.physicsScale
              };
              this.arrowSprite.alpha = 0.8;
              var _difX = _bPos.x - pos.x;
              var _difY = _bPos.y - pos.y;

              var _l = this.length(_difX, _difY);
              _difX /= _l;
              _difY /= _l;

              _l = Math.min(_config2.default.maxForce, _l);

              _difX *= _l;
              _difY *= _l;

              // console.log(l);

              var ang = Math.atan2(_difY / _l, _difX / _l);

              this.arrowSprite.rotation = ang - parent.rotation;
              this.arrowSprite.scale.x = _l / 512.0;
            } else {
              this.arrowSprite.alpha = 0.0;
            }
        }
      }
    }
  }, {
    key: 'handleGameEvent',
    value: function handleGameEvent(parent, evt) {
      if (evt.eventType.startsWith('turn_')) {
        if (evt.eventType === 'turn_' + this.team) {
          parent.alpha = 1.0;
          this.myTurn = true;
          parent.rotation = 0;
          var bod = parent.physics.body;
          bod.SetLinearVelocity(new b2Vec2(0, 0));
          bod.SetAngularVelocity(0);
          bod.SetTransform(bod.GetWorldCenter(), 0);
        } else {
          parent.alpha = 0.5;
          this.arrowSprite.alpha = 0.0;
          this.myTurn = false;
        }
      } else if (evt.eventType === 'play_turn') {
        parent.alpha = 1.0;
        this.arrowSprite.alpha = 0.0;
      }
      _Log.log.debug(evt.parameters.message);
    }
  }]);

  return ForceInputScript;
}(_Script2.Script);

exports.ForceInputScript = ForceInputScript;

},{"Entity":2,"Log":4,"Managers/EventManager":8,"Managers/InputManager":9,"Managers/ResourceManager":10,"Script":11,"config.json":1}],14:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GoalScript = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Log = require('Log');

var _Script2 = require('Script');

var _EventManager = require('Managers/EventManager');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var GoalScript = function (_Script) {
  _inherits(GoalScript, _Script);

  function GoalScript(parameters) {
    _classCallCheck(this, GoalScript);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(GoalScript).call(this));

    _this.team = parameters.team;
    _this.canScore = false;
    _this.eventTypes.push('new_game', 'goal');
    return _this;
  }

  _createClass(GoalScript, [{
    key: 'searchEntities',
    value: function searchEntities(rootEntity, condition) {
      if (condition(rootEntity)) {
        return rootEntity;
      } else {
        for (var i = 0; i < rootEntity.children.length; i++) {
          var child = rootEntity.children[i];
          var s = this.searchEntities(child, condition);
          if (s) return s;
        }
        return null;
      }
    }
  }, {
    key: 'init',
    value: function init(parent, rootEntity) {
      this.puck = this.searchEntities(rootEntity, function (entity) {
        if (entity.tags) {
          return entity.tags.indexOf('puck') >= 0;
        } else {
          return false;
        }
      });
    }
  }, {
    key: 'update',
    value: function update(parent, rootEntity, delta) {
      if (this.canScore) {
        var fix = parent.physics.fixture;
        if (this.puck.physics.body) {
          var pos = this.puck.physics.body.GetWorldCenter();
          if (fix.TestPoint(pos)) {
            _EventManager.EventMan.publish({
              eventType: "goal_" + this.team,
              parameters: {}
            });
            _EventManager.EventMan.publish({
              eventType: "physics_speed",
              parameters: { speed: 0.1 }
            });
            this.canScore = false;
            console.log("goal_" + this.team);
          }
        }
      }
    }
  }, {
    key: 'handleGameEvent',
    value: function handleGameEvent(parent, evt) {
      if (evt.eventType === 'new_game') {
        this.canScore = true;
      }
      if (evt.eventType.includes('goal')) {
        this.canScore = false;
      }
    }
  }]);

  return GoalScript;
}(_Script2.Script);

exports.GoalScript = GoalScript;

},{"Log":4,"Managers/EventManager":8,"Script":11}],15:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.InitializeWorld = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Log = require('Log');

var _Script2 = require('Script');

var _EventManager = require('Managers/EventManager');

var _config = require('config.json');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * This is a skeleton for writing scripts. Remember to add the created script to
 * Scripts/Scripts.js.
 */

var InitializeWorld = function (_Script) {
  _inherits(InitializeWorld, _Script);

  function InitializeWorld(parameters) {
    _classCallCheck(this, InitializeWorld);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(InitializeWorld).call(this));

    _this.resetTimer = {
      time: 0.0,
      running: false,
      limit: _config2.default.victoryTime
    };
    _this.redMoves = 0;
    _this.blueMoves = 0;
    _this.eventTypes.push('goal', 'new_game', 'red', 'blue', 'physics_sleeping', 'play_turn');
    _this.playing = false;
    return _this;
  }

  _createClass(InitializeWorld, [{
    key: 'init',
    value: function init(parent, rootEntity) {
      // When an entity is created, this is run
      _EventManager.EventMan.publish({
        eventType: "new_game",
        parameters: {}
      });
    }
  }, {
    key: 'update',
    value: function update(parent, rootEntity, delta) {
      if (this.resetTimer.running) {
        this.resetTimer.time += delta;
        if (this.resetTimer.time > this.resetTimer.limit) {
          _Log.log.debug("RESET");
          this.resetTimer.time = 0.0;
          this.resetTimer.running = false;
          _EventManager.EventMan.publish({
            eventType: "new_game",
            parameters: {}
          });
          _EventManager.EventMan.publish({
            eventType: "physics_speed",
            parameters: { speed: 1.0 }
          });
        }
      }
    }
  }, {
    key: 'resetTurns',
    value: function resetTurns() {
      _Log.log.debug("Reset turns, red turn");
      this.playing = false;
      _EventManager.EventMan.publish({
        eventType: 'turn_red',
        parameters: {}
      });
      _EventManager.EventMan.publish({
        eventType: 'physics_pause',
        parameters: {}
      });
      this.redMoves = 0;
      this.blueMoves = 0;
    }
  }, {
    key: 'handleGameEvent',
    value: function handleGameEvent(parent, evt) {
      if (evt.eventType === 'new_game') {
        this.resetTurns();
      } else if (evt.eventType === 'play_turn') {
        this.playing = true;
      } else if (evt.eventType === 'goal_red') {
        _Log.log.debug("RED SCORES");
        this.resetTimer.running = true;
      } else if (evt.eventType === 'goal_blue') {
        _Log.log.debug("BLUE SCORES");
        this.resetTimer.running = true;
      } else if (evt.eventType === 'red_move') {
        this.redMoves += 1;
        _Log.log.debug("Red Moves: " + this.redMoves);
        if (this.redMoves === 3) {
          // Count players at init
          _EventManager.EventMan.publish({
            eventType: 'turn_blue',
            parameters: {}
          });
        }
      } else if (evt.eventType === 'blue_move') {
        this.blueMoves += 1;
        _Log.log.debug("Blue Moves: " + this.blueMoves);
        if (this.blueMoves === 3) {
          _EventManager.EventMan.publish({
            eventType: 'play_turn',
            parameters: {}
          });
          _EventManager.EventMan.publish({
            eventType: 'physics_play',
            parameters: {}
          });
        }
      } else if (evt.eventType === 'physics_sleeping') {
        if (this.playing) {
          _Log.log.debug("Physics sleeping, red turn");
          this.resetTurns();
        }
      }
    }
  }]);

  return InitializeWorld;
}(_Script2.Script);

exports.InitializeWorld = InitializeWorld;

},{"Log":4,"Managers/EventManager":8,"Script":11,"config.json":1}],16:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.InputScript = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Log = require('Log');

var _Script2 = require('Script');

var _InputManager = require('Managers/InputManager');

var _EventManager = require('Managers/EventManager');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var InputScript = function (_Script) {
  _inherits(InputScript, _Script);

  function InputScript(parameters) {
    _classCallCheck(this, InputScript);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(InputScript).call(this, parameters));

    _this.eventTypes.push('input_test');
    return _this;
  }

  _createClass(InputScript, [{
    key: 'update',
    value: function update(parent, rootEntity, delta) {
      if (_InputManager.InputMan.keyDown.up) {
        parent.position.y -= 1;
      }
      if (_InputManager.InputMan.keyDown.down) {
        parent.position.y += 1;
      }
      if (_InputManager.InputMan.keyDown.left) {
        parent.position.x -= 1;
      }
      if (_InputManager.InputMan.keyDown.right) {
        parent.position.x += 1;
      }
      if (_InputManager.InputMan.keyPressed.right) {
        _EventManager.EventMan.publish({ eventType: 'audio', parameters: { audio: 'audio_hit_noise' } });
      }
    }
  }, {
    key: 'handleGameEvent',
    value: function handleGameEvent(parent, evt) {
      _Log.log.debug(evt.parameters.message);
    }
  }]);

  return InputScript;
}(_Script2.Script);

exports.InputScript = InputScript;

},{"Log":4,"Managers/EventManager":8,"Managers/InputManager":9,"Script":11}],17:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PointScript = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Log = require('Log');

var _Script2 = require('Script');

var _EventManager = require('Managers/EventManager');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * This is a skeleton for writing scripts. Remember to add the created script to
 * Scripts/Scripts.js.
 */

var PointScript = function (_Script) {
  _inherits(PointScript, _Script);

  function PointScript(parameters) {
    _classCallCheck(this, PointScript);

    // Add event types to listen to

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(PointScript).call(this));

    _this.team = parameters.team;
    _this.eventTypes.push('goal_' + _this.team);
    _this.textStyle = {
      font: '72px Arial',
      fill: 0x666666,
      align: 'center'
    };
    _this.score = 0;
    return _this;
  }

  // When an entity is created, this is run


  _createClass(PointScript, [{
    key: 'init',
    value: function init(parent, rootEntity) {
      _Log.log.debug("POINTS");
      _Log.log.debug(parent.position);
      this.text = new PIXI.Text(this.score, this.textStyle);
      parent.addChild(this.text);
    }

    // Runs each update frame

  }, {
    key: 'update',
    value: function update(parent, rootEntity, delta) {}
    // log.debug(parent.position);


    // Handles events. To catch events, eventTypes must be declared

  }, {
    key: 'handleGameEvent',
    value: function handleGameEvent(parent, evt) {
      if (evt.eventType === 'goal_' + this.team) {
        _Log.log.debug("Goal for " + this.team);
        this.score += 1;
        this.text.text = this.score;
      }
    }
  }]);

  return PointScript;
}(_Script2.Script);

exports.PointScript = PointScript;

},{"Log":4,"Managers/EventManager":8,"Script":11}],18:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ResetPositionScript = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Log = require('Log');

var _Script2 = require('Script');

var _EventManager = require('Managers/EventManager');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * This is a skeleton for writing scripts. Remember to add the created script to
 * Scripts/Scripts.js.
 */

var ResetPositionScript = function (_Script) {
  _inherits(ResetPositionScript, _Script);

  function ResetPositionScript(parameters) {
    _classCallCheck(this, ResetPositionScript);

    // Add event types to listen to

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ResetPositionScript).call(this));

    _this.eventTypes.push('new_game');
    return _this;
  }

  // When an entity is created, this is run


  _createClass(ResetPositionScript, [{
    key: 'init',
    value: function init(parent, rootEntity) {
      _Log.log.debug("Initing reset script");
    }

    // Runs each update frame

  }, {
    key: 'update',
    value: function update(parent, rootEntity, delta) {
      if (!this.originalPosition) {
        if (parent.physics.body) {
          var pos = parent.physics.body.GetWorldCenter();
          this.originalPosition = {
            x: pos.get_x(),
            y: pos.get_y()
          };
        }
      }
    }

    // Handles events. To catch events, eventTypes must be declared

  }, {
    key: 'handleGameEvent',
    value: function handleGameEvent(parent, evt) {
      if (evt.eventType === 'new_game') {
        parent.physics.body.SetTransform(new b2Vec2(this.originalPosition.x, this.originalPosition.y), 0.0);
        parent.physics.body.SetLinearVelocity(new b2Vec2(0, 0));
        parent.physics.body.SetAngularVelocity(0);
      }
    }
  }]);

  return ResetPositionScript;
}(_Script2.Script);

exports.ResetPositionScript = ResetPositionScript;

},{"Log":4,"Managers/EventManager":8,"Script":11}],19:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Scripts = undefined;

var _InputScript = require('./InputScript');

var _AnimationScript = require('./AnimationScript');

var _ForceInputScript = require('./ForceInputScript');

var _GoalScript = require('./GoalScript');

var _InitializeWorld = require('./InitializeWorld');

var _ResetPositionScript = require('./ResetPositionScript');

var _PointScript = require('./PointScript');

var scripts = {
  // Add scripts here, remember to import
  inputScript: _InputScript.InputScript,
  forceInputScript: _ForceInputScript.ForceInputScript,
  animationScript: _AnimationScript.AnimationScript,
  goalScript: _GoalScript.GoalScript,
  initializeWorld: _InitializeWorld.InitializeWorld,
  resetPositionScript: _ResetPositionScript.ResetPositionScript,
  pointScript: _PointScript.PointScript
};

exports.Scripts = scripts;

},{"./AnimationScript":12,"./ForceInputScript":13,"./GoalScript":14,"./InitializeWorld":15,"./InputScript":16,"./PointScript":17,"./ResetPositionScript":18}],20:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.System = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Log = require('Log');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Parent class for systems. A system is run for all entites once each update
 * loop. All changes to entities should happen solely via systems.
 */

var System = function () {
  function System() {
    _classCallCheck(this, System);
  }

  /**
    * Init runs after game has been instantiated
    */


  _createClass(System, [{
    key: 'init',
    value: function init(rootEntity) {}
  }, {
    key: 'updateEntities',
    value: function updateEntities(entity, rootEntity, delta) {
      var _this = this;

      entity.children.forEach(function (child) {
        _this.updateEntities(child, rootEntity, delta);
      });
      this.applySystem(entity, rootEntity, delta);
    }
  }, {
    key: 'handleEvents',
    value: function handleEvents() {}

    /**
      * An implemented System should override this method. This is the system's
      * main method, and is applied to all entities.
      */
    /**
     * An implemented System should override this method. This is the system's
     * main method, and is applied to all entities.
     *
     * @param  {Entity} entity     Entity to apply to.
     * @param  {Entity} rootEntity Topmost entity for which system is applied. Can
     *                             be used to access other entities (WARNING:
     *                             other entities should not be modified
     *                             externally! This can cause unexpected
     *                             behaviour.)
     * @param  {number} delta      Time since last update
     */

  }, {
    key: 'applySystem',
    value: function applySystem(entity, rootEntity, delta) {
      _Log.log.warn('System apply not defined');
    }

    /**
     * Run once for each update.
     *
     * @param  {Entity} rootEntity Topmost entity. All entities below it are updated
     *                             (including itself).
     * @param  {number} delta      Time since last update
     */

  }, {
    key: 'updateSystem',
    value: function updateSystem(rootEntity, delta) {}

    /**
     * Updates the system and its entities, and handles events. Should not be
     * overriden.
     *
     * @param  {Entity} rootEntity Topmost entity. All entities below it are updated
     *                             (including itself).
     * @param  {number} delta      Time since last update
     */

  }, {
    key: 'update',
    value: function update(rootEntity, delta) {
      this.updateSystem(rootEntity, delta);
      this.updateEntities(rootEntity, rootEntity, delta);
      this.handleEvents();
    }
  }]);

  return System;
}();

exports.System = System;

},{"Log":4}],21:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EventSystem = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _System2 = require('System');

var _Log = require('Log');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Handles the events of all entities
 */

var EventSystem = function (_System) {
  _inherits(EventSystem, _System);

  function EventSystem() {
    _classCallCheck(this, EventSystem);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(EventSystem).apply(this, arguments));
  }

  _createClass(EventSystem, [{
    key: 'applySystem',
    value: function applySystem(entity, rootEntity, delta) {
      if (entity.handleEvents) {
        entity.handleEvents();
      }
    }
  }]);

  return EventSystem;
}(_System2.System);

exports.EventSystem = EventSystem;

},{"Log":4,"System":20}],22:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PhysicsSystem = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _System2 = require('System');

var _Log = require('Log');

var _config = require('config.json');

var _config2 = _interopRequireDefault(_config);

var _EventManager = require('Managers/EventManager');

var _PhysicsUtil = require('Util/PhysicsUtil');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var PhysicsSystem = function (_System) {
  _inherits(PhysicsSystem, _System);

  function PhysicsSystem() {
    var timeStep = arguments.length <= 0 || arguments[0] === undefined ? 3 : arguments[0];
    var maxIPF = arguments.length <= 1 || arguments[1] === undefined ? 16 : arguments[1];
    var integrator = arguments.length <= 2 || arguments[2] === undefined ? 'verlet' : arguments[2];

    _classCallCheck(this, PhysicsSystem);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(PhysicsSystem).call(this));

    _this.box2DShortcuts();
    _this.paused = true;
    _this.speed = 1.0;
    var gravity = new b2Vec2(0, 0.0);
    var allowSleep = false;
    _this.world = new b2World(gravity);

    _this.bodies = [];

    // var bd_ground = new Box2D.b2BodyDef();
    // var ground = world.CreateBody(bd_ground);
    // var shape0 = new Box2D.b2EdgeShape();
    // shape0.Set(new Box2D.b2Vec2(-40.0, -6.0), new Box2D.b2Vec2(40.0, -6.0));
    // ground.CreateFixture(shape0, 0.0);

    _this.timer = 0;
    _this.physicsScale = 16;
    // this.engine = Matter.Engine.create();
    // this.engine.timing.timeScale = 0.5;
    // this.world = this.engine.world;
    // this.world.gravity = {x: 0, y: 0};
    _this.events = [];
    _this.eventTypes = ['physics'];
    if (_config2.default.debugMode) _this.debug();
    return _this;
  }

  _createClass(PhysicsSystem, [{
    key: 'box2DShortcuts',
    value: function box2DShortcuts() {
      window.b2Vec2 = Box2D.b2Vec2;
      window.b2AABB = Box2D.b2AABB;
      window.b2BodyDef = Box2D.b2BodyDef;
      window.b2Body = Box2D.b2Body;
      window.b2FixtureDef = Box2D.b2FixtureDef;
      window.b2Fixture = Box2D.b2Fixture;
      window.b2World = Box2D.b2World;
      window.b2MassData = Box2D.b2MassData;
      window.b2PolygonShape = Box2D.b2PolygonShape;
      window.b2CircleShape = Box2D.b2CircleShape;
      window.b2DebugDraw = Box2D.b2DebugDraw;
      window.b2MouseJointDef = Box2D.b2MouseJointDef;
    }
  }, {
    key: 'init',
    value: function init(rootEntity) {
      _Log.log.debug("Initializing Physics System");
      _EventManager.EventMan.registerListener(this);
    }
  }, {
    key: 'debug',
    value: function debug() {}
  }, {
    key: 'addEvent',
    value: function addEvent(evt) {
      this.events.push(evt);
    }
  }, {
    key: 'handleEvents',
    value: function handleEvents() {
      var _this2 = this;

      this.events.forEach(function (evt) {
        if (evt.eventType === 'physics_pause') {
          _Log.log.debug("PAUSE PHYSICS");
          _this2.paused = true;
        } else if (evt.eventType === 'physics_play') {
          _Log.log.debug("RUN PHYSICS");
          _this2.paused = false;
        } else if (evt.eventType === 'physics_speed') {
          _Log.log.debug("Adjusting physics speed: " + evt.parameters.speed);
          _this2.speed = evt.parameters.speed;
        }
      });
      this.events = [];
    }
  }, {
    key: 'applySystem',
    value: function applySystem(entity, rootEntity, delta) {
      if (entity.physics) {
        // Add the entity if it isn't in the world yet
        if (!entity.physics.inWorld) {
          entity.physics.body = this.world.CreateBody(entity.physics.bodyDef);
          var bod = entity.physics.body;
          entity.physics.fixture = bod.CreateFixture(entity.physics.fixDef);

          this.bodies.push(bod);

          bod.SetAwake(1);
          bod.SetActive(1);
          // Matter.World.add(this.world, entity.physics.body);
          entity.physics.inWorld = true;
          // console.log(entity.physics.fixture);
          // console.log(entity.physics.body.GetPosition().get_x());
        }
        // Update the position of the entity to that of the
        // body

        var data = _PhysicsUtil.PhysicsUtil.objectData(entity.physics.body);
        entity.position = {
          x: data.x,
          y: data.y
        };

        entity.rotation = data.angle;
      }
    }
  }, {
    key: 'updateSystem',
    value: function updateSystem(rootEntity, delta) {
      if (!this.paused) {
        this.world.Step(delta / 1000.0 * this.speed, 2, 2);
      }
      this.handleEvents();

      var allSleeping = true;
      for (var i = 0; i < this.bodies.length; i++) {
        var body = this.bodies[i];
        var vel = body.GetLinearVelocity();
        if (Math.abs(vel.get_x()) >= _config2.default.minSleepVel || Math.abs(vel.get_y()) >= _config2.default.minSleepVel) {
          allSleeping = false;
          break;
        }
      }
      if (allSleeping) {
        _EventManager.EventMan.publish({
          eventType: 'physics_sleeping',
          parameters: {}
        });
      }
    }
  }]);

  return PhysicsSystem;
}(_System2.System);

exports.PhysicsSystem = PhysicsSystem;

},{"Log":4,"Managers/EventManager":8,"System":20,"Util/PhysicsUtil":24,"config.json":1}],23:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ScriptSystem = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _System2 = require('System');

var _Log = require('Log');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ScriptSystem = function (_System) {
  _inherits(ScriptSystem, _System);

  function ScriptSystem() {
    _classCallCheck(this, ScriptSystem);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(ScriptSystem).apply(this, arguments));
  }

  _createClass(ScriptSystem, [{
    key: 'init',
    value: function init(rootEntity) {
      _Log.log.debug("Initializing ScriptSystem");
    }
  }, {
    key: 'applySystem',
    value: function applySystem(entity, rootEntity, delta) {
      if (entity.scripts) {
        entity.scripts.forEach(function (scriptObj) {
          scriptObj.update(entity, rootEntity, delta);
        });
      }
    }
  }]);

  return ScriptSystem;
}(_System2.System);

exports.ScriptSystem = ScriptSystem;

},{"Log":4,"System":20}],24:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PhysicsUtil = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Log = require('Log');

var _config = require('config.json');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PhysicsUtil = function () {
  function PhysicsUtil() {
    _classCallCheck(this, PhysicsUtil);
  }

  _createClass(PhysicsUtil, null, [{
    key: 'objectData',

    /**
     * Converts a physics body into positional data (position and rotation)
     * @param  {b2Body} body The body to extract data from
     * @return {Object}      The data
     */
    value: function objectData(body) {
      var data = {};
      var pos = body.GetPosition();
      data.x = pos.get_x() * _config2.default.physicsScale;
      data.y = pos.get_y() * _config2.default.physicsScale;
      data.angle = body.GetAngle();
      return data;
    }

    /**
     * Convert game coordinates to physics coordinates
     * @param  {Vec2}   vec The vector to convert
     * @return {b2Vec2}     The converted vector
     */

  }, {
    key: 'worldToPhysics',
    value: function worldToPhysics(vec) {
      return new b2Vec2(vec.x / _config2.default.physicsScale, vec.y / _config2.default.physicsScale);
    }
  }]);

  return PhysicsUtil;
}();

exports.PhysicsUtil = PhysicsUtil;

},{"Log":4,"config.json":1}],25:[function(require,module,exports){
module.exports={

  "left": 37,
  "up": 38,
  "right": 39,
  "down": 40,
}

},{}]},{},[5])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY29uZmlnLmpzb24iLCJzcmMvanMvRW50aXR5LmpzIiwic3JjL2pzL0dhbWUuanMiLCJzcmMvanMvTG9nLmpzIiwic3JjL2pzL01haW4uanMiLCJzcmMvanMvTWFuYWdlci5qcyIsInNyYy9qcy9NYW5hZ2Vycy9BdWRpb01hbmFnZXIuanMiLCJzcmMvanMvTWFuYWdlcnMvRXZlbnRNYW5hZ2VyLmpzIiwic3JjL2pzL01hbmFnZXJzL0lucHV0TWFuYWdlci5qcyIsInNyYy9qcy9NYW5hZ2Vycy9SZXNvdXJjZU1hbmFnZXIuanMiLCJzcmMvanMvU2NyaXB0LmpzIiwic3JjL2pzL1NjcmlwdHMvQW5pbWF0aW9uU2NyaXB0LmpzIiwic3JjL2pzL1NjcmlwdHMvRm9yY2VJbnB1dFNjcmlwdC5qcyIsInNyYy9qcy9TY3JpcHRzL0dvYWxTY3JpcHQuanMiLCJzcmMvanMvU2NyaXB0cy9Jbml0aWFsaXplV29ybGQuanMiLCJzcmMvanMvU2NyaXB0cy9JbnB1dFNjcmlwdC5qcyIsInNyYy9qcy9TY3JpcHRzL1BvaW50U2NyaXB0LmpzIiwic3JjL2pzL1NjcmlwdHMvUmVzZXRQb3NpdGlvblNjcmlwdC5qcyIsInNyYy9qcy9TY3JpcHRzL1NjcmlwdHMuanMiLCJzcmMvanMvU3lzdGVtLmpzIiwic3JjL2pzL1N5c3RlbXMvRXZlbnRTeXN0ZW0uanMiLCJzcmMvanMvU3lzdGVtcy9QaHlzaWNzU3lzdGVtLmpzIiwic3JjL2pzL1N5c3RlbXMvU2NyaXB0U3lzdGVtLmpzIiwic3JjL2pzL1V0aWwvUGh5c2ljc1V0aWwuanMiLCJzcmMva2V5cy5qc29uIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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ckMsRUFEb0M7U0FBZixDQUF2QixDQURrQjtPQUFwQjs7OztTQVBFOzs7UUFlRTs7Ozs7Ozs7Ozs7O0FDbEJSOztBQUNBOzs7Ozs7OztJQUVNOzs7Ozs7Ozs7Ozs7OytCQU1jLE1BQU07QUFDdEIsVUFBSSxPQUFPLEVBQVAsQ0FEa0I7QUFFdEIsVUFBTSxNQUFNLEtBQUssV0FBTCxFQUFOLENBRmdCO0FBR3RCLFdBQUssQ0FBTCxHQUFTLElBQUksS0FBSixLQUFjLGlCQUFJLFlBQUosQ0FIRDtBQUl0QixXQUFLLENBQUwsR0FBUyxJQUFJLEtBQUosS0FBYyxpQkFBSSxZQUFKLENBSkQ7QUFLdEIsV0FBSyxLQUFMLEdBQWEsS0FBSyxRQUFMLEVBQWIsQ0FMc0I7QUFNdEIsYUFBTyxJQUFQLENBTnNCOzs7Ozs7Ozs7OzttQ0FjRixLQUFLO0FBQ3pCLGFBQU8sSUFBSSxNQUFKLENBQVcsSUFBSSxDQUFKLEdBQU0saUJBQUksWUFBSixFQUFrQixJQUFJLENBQUosR0FBTSxpQkFBSSxZQUFKLENBQWhELENBRHlCOzs7O1NBcEJ2Qjs7O1FBeUJFOzs7QUM1QlI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJtb2R1bGUuZXhwb3J0cz17XG4gIFwiZnBzXCI6IDYwLFxuICBcImNvbnRhaW5lclwiOlwiI2dhbWUtY29udGFpbmVyXCIsXG4gIFwibG9nTGV2ZWxcIjogMCxcbiAgXCJkZWJ1Z01vZGVcIjp0cnVlLFxuICBcInBoeXNpY3NTdGVwc1BlclVwZGF0ZVwiOjQsXG4gIFwicGh5c2ljc1NjYWxlXCI6MTYsXG4gIFwidmljdG9yeVRpbWVcIjozMjAwLFxuICBcIm1pblNsZWVwVmVsXCI6MC4xLFxuICBcIm1heEZvcmNlXCI6IDE1MCxcbiAgXCJyZW5kZXJlclwiOntcbiAgICBcIm9wdGlvbnNcIjoge1xuICAgICAgXCJhbnRpYWxpYXNcIjogdHJ1ZSxcbiAgICAgIFwidHJhbnNwYXJlbnRcIjogZmFsc2VcbiAgICB9LFxuICAgIFwic2l6ZVwiOntcbiAgICAgIFwieFwiOjk2MCxcbiAgICAgIFwieVwiOjY0MFxuICAgIH1cbiAgfSxcbiAgXCJyZXNvdXJjZUxpc3RzXCI6W1xuICAgIFwicmVzL2ZpbGVsaXN0Lmpzb25cIlxuICBdLFxuICBcInN0YXRpY1Jlc291cmNlc1wiOltcbiAgICBcInJlcy9zcHJpdGUvc3ByaXRlLmpzb25cIixcbiAgICBcInJlcy9zb3VuZHMvc291bmRzLmpzb25cIlxuICBdLFxuICBcImF1ZGlvUmVzb3VyY2VzXCI6W1xuICAgIFwicmVzL3NvdW5kcy9zb3VuZHMuanNvblwiXG4gIF1cbn1cbiIsImltcG9ydCB7cmVzb3VyY2VzfSBmcm9tICdNYW5hZ2Vycy9SZXNvdXJjZU1hbmFnZXInO1xuaW1wb3J0IHtsb2d9IGZyb20gJ0xvZyc7XG5pbXBvcnQge0lucHV0TWFufSBmcm9tICdNYW5hZ2Vycy9JbnB1dE1hbmFnZXInO1xuaW1wb3J0IHtTY3JpcHRzfSBmcm9tICdTY3JpcHRzL1NjcmlwdHMnO1xuaW1wb3J0IHtFdmVudE1hbn0gZnJvbSAnTWFuYWdlcnMvRXZlbnRNYW5hZ2VyJztcbmltcG9ydCBjZmcgZnJvbSAnY29uZmlnLmpzb24nO1xuXG5jbGFzcyBFbnRpdHkgZXh0ZW5kcyBQSVhJLkNvbnRhaW5lciB7XG4gIGNvbnN0cnVjdG9yKGRhdGEpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuZXZlbnRUeXBlcyA9IFtdO1xuICAgIHRoaXMuZXZlbnRzID0gW107XG4gICAgdGhpcy5pc0FjdGl2ZSA9IHRydWU7XG4gICAgdGhpcy50YWdzID0gW107ICAgICAgICAgLy8gVGFncyBjYW4gYmUgdXNlZCB0byBzZWFyY2ggYW5kIGZpbHRlciBlbnRpdGllc1xuICAgIHRoaXMuc2NyaXB0cyA9IFtdO1xuICB9XG5cbi8qKlxuICogSW5pdGlhbGl6ZXNcbiAqIEBwYXJhbSAge1tFbnRpdHl9IHJvb3RFbnRpdHkgVG9wbW9zdCBlbnRpdHlcbiAqL1xuICBpbml0KHJvb3RFbnRpdHkpe1xuICAgIHRoaXMuY2hpbGRyZW4uZm9yRWFjaCgoY2hpbGQpID0+IHtcbiAgICAgIGlmKGNoaWxkLmluaXQpIGNoaWxkLmluaXQocm9vdEVudGl0eSk7XG4gICAgfSk7XG4gICAgdGhpcy5zY3JpcHRzLmZvckVhY2goKHNjcmlwdCkgPT4ge1xuICAgICAgc2NyaXB0LmluaXQodGhpcywgcm9vdEVudGl0eSk7XG4gICAgfSk7XG4gICAgRXZlbnRNYW4ucmVnaXN0ZXJMaXN0ZW5lcih0aGlzKTtcbiAgfVxuXG4vKipcbiAqIEhhbmRsZXMgZXZlbnRzLiBDbGVhcnMgdGhlIGxpc3Qgb2YgZXZlbnRzIG9uY2UgdGhleSBoYXZlIGJlZW4gaGFuZGxlZC5cbiAqL1xuICAvLyBUT0RPOiBDaGVjayBpZiBldmVudCBpcyByZWxldmFudCB0byB0aGUgc2NyaXB0LlxuICBoYW5kbGVFdmVudHMoKSB7XG4gICAgdGhpcy5ldmVudHMuZm9yRWFjaCgoZXZ0KSA9PiB7XG4gICAgICB0aGlzLnNjcmlwdHMuZm9yRWFjaCgoc2NyaXB0KSA9PiB7XG4gICAgICAgIHNjcmlwdC5oYW5kbGVHYW1lRXZlbnQodGhpcywgZXZ0KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIHRoaXMuZXZlbnRzID0gW107XG4gIH1cblxuLyoqXG4gKiBGaW5kcyB0aGUgZmlyc3QgZW50aXR5IHdpdGggdGhlIGdpdmVuIHRhZy5cbiAqIEBwYXJhbSAge1N0cmluZ30gdGFnIFRhZyB0byBzZWFyY2ggZm9yXG4gKiBAcmV0dXJuIHtFbnRpdHl9ICAgICBSZXR1cm5zIHRoZSBmaXJzdCBmb3VuZCBlbnRpdHksIG9yIG5vdGhpbmcgaWYgbm90IGZvdW5kXG4gKi9cbiAgZmluZEVudGl0eVdpdGhUYWcodGFnKSB7XG4gICAgbGV0IGluZG9mID0gdGhpcy50YWdzLmluZGV4T2YodGFnKTtcbiAgICBpZiAoaW5kb2YgPj0gMCkgeyByZXR1cm4gdGhpczsgfVxuICAgIGVsc2Uge1xuICAgICAgZm9yKGxldCBpID0gMDsgaSA8IHRoaXMuY2hpbGRyZW4ubGVuZ3RoO2krKykge1xuICAgICAgICBsZXQgY2hpbGQgPSB0aGlzLmNoaWxkcmVuW2ldO1xuICAgICAgICBsZXQgZm91bmQ7XG4gICAgICAgIGlmKGNoaWxkLmZpbmRFbnRpdHlXaXRoVGFnKSB7XG4gICAgICAgICAgZm91bmQgPSBjaGlsZC5maW5kRW50aXR5V2l0aFRhZyh0YWcpO1xuICAgICAgICB9XG4gICAgICAgIGlmKGZvdW5kKSB7XG4gICAgICAgICAgcmV0dXJuIGZvdW5kO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbi8qKlxuICogRmluZHMgdGhlIGZpcnN0IGVudGl0eSB3aXRoIHRoZSBnaXZlbiBuYW1lLlxuICogQHBhcmFtICB7U3RyaW5nfSBuYW1lIE5hbWUgdG8gc2VhcmNoIGZvclxuICogQHJldHVybiB7RW50aXR5fSAgICAgIFJldHVybnMgdGhlIGZpcnN0IGVudGl0eSwgb3Igbm90aGluZyBpZiBub3QgZm91bmRcbiAqL1xuICBmaW5kRW50aXR5V2l0aE5hbWUobmFtZSkge1xuICAgIGlmICh0aGlzLm5hbWUgPT09IG5hbWUpIHsgcmV0dXJuIHRoaXM7IH1cbiAgICBlbHNlIHtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5jaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICBsZXQgY2hpbGQgPSB0aGlzLmNoaWxkcmVuW2ldO1xuICAgICAgICBsZXQgZm91bmQ7XG4gICAgICAgIGlmIChjaGlsZC5maW5kRW50aXR5V2l0aE5hbWUpIHtcbiAgICAgICAgICBmb3VuZCA9IGNoaWxkLmZpbmRFbnRpdHlXaXRoTmFtZShuYW1lKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZm91bmQpIHtcbiAgICAgICAgICByZXR1cm4gZm91bmQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuLyoqXG4gKiBUdXJucyBhIHNldCBvZiB2ZXJ0aWNlcyBpbnRvIGEgZm9ybWF0IHN1aXRhYmxlIGZvciBjcmVhdGluZyBhIFBpeGkgcG9seWdvbi5cbiAqIEBwYXJhbSAge0FycmF5W1ZlYzJdfSB2ZXJ0aWNlcyBMaXN0IG9mIHZlcnRpY2VzXG4gKiBAcGFyYW0gIHtWZWMyfSAgICAgICAgb2Zmc2V0ICAgQW4gb2Zmc2V0IGZvciBhbGwgdmVydGljZXNcbiAqIEByZXR1cm4ge0FycmF5W251bWJlcl19ICAgICAgICBMaXN0IG9mIHZlcnRpY2VzIGFzIFt4MSwgeTEsIHgyLCB5MiwgLi4uXVxuICovXG4gIGNvbnN0cnVjdFBpeGlQb2x5Z29uKHZlcnRpY2VzLCBvZmZzZXQpIHtcbiAgICBsZXQgbCA9IFtdO1xuICAgIHZlcnRpY2VzLmZvckVhY2goKHZlcnRleCkgPT4ge1xuICAgICAgbC5wdXNoKHZlcnRleC54IC0gb2Zmc2V0LngpO1xuICAgICAgbC5wdXNoKHZlcnRleC55IC0gb2Zmc2V0LnkpO1xuICAgIH0pO1xuICAgIHJldHVybiBsO1xuICB9XG5cbi8qKlxuICogQ3JlYXRlcyBhIGJveDJEIHN1aXRhYmxlIGxpc3Qgb2YgdmVydGljZXMgZm9yIGNyZWF0aW5nIGEgY29udmV4IHBvbHlnb24uXG4gKiBAcGFyYW0gIHtBcnJheVtWZWMyXX0gdmVydGljZXMgTGlzdCBvZiB2ZXJ0aWNlc1xuICogQHBhcmFtICB7VmVjMn0gICAgICAgIG9mZnNldCAgIEFuIG9mZnNldCBmb3IgYWxsIHZlcnRpY2VzXG4gKiBAcmV0dXJuIHtBcnJheVtiMlZlYzJdfSAgICAgICAgQ29udmVydGVkIGxpc3Qgb2YgdmVydGljZXNcbiAqL1xuICBjcmVhdGVCb3gyRFZlcnRpY2VzKHZlcnRpY2VzLCBvZmZzZXQgPSB7eDogMC4wLCB5OiAwLjB9KSB7XG4gICAgbGV0IHZlcnRzID0gW107XG4gICAgdmVydGljZXMuZm9yRWFjaCgodikgPT4ge1xuICAgICAgbGV0IHZlYyA9IG5ldyBiMlZlYzIoXG4gICAgICAgICh2LnggKyBvZmZzZXQueCkgKiAxLjAgLyBjZmcucGh5c2ljc1NjYWxlLFxuICAgICAgICAodi55ICsgb2Zmc2V0LnkpICogMS4wIC8gY2ZnLnBoeXNpY3NTY2FsZVxuICAgICAgKTtcbiAgICAgIHZlcnRzLnB1c2godmVjKTtcbiAgICB9KTtcbiAgICByZXR1cm4gdmVydHM7XG4gIH1cblxuLyoqXG4gKiBBZGRzIGEgc2NyaXB0IHRvIHRoZSBlbnRpdHkuXG4gKiBAcGFyYW0ge1N0cmluZ30gc2NyaXB0TmFtZSBUaGUgdHlwZSBvZiBzY3JpcHQgdG8gYWRkXG4gKiBAcGFyYW0ge09iamVjdH0gcGFyYW1ldGVycyBQYXJhbWV0ZXJzIHRoYXQgYXJlIHBhc3NlZCB0byB0aGUgc2NyaXB0XG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdHJ1Y3RvclxuICovXG4gIC8vIFRPRE86IFJlbW92ZSBkdXBsaWNhdGUgZXZlbnQgdHlwZXMgKGtlZXAgb25seSB0b3Btb3N0KVxuICBhZGRTY3JpcHQoc2NyaXB0TmFtZSwgcGFyYW1ldGVycykge1xuICAgIGxldCBzY3JpcHQgPSBuZXcgU2NyaXB0c1tzY3JpcHROYW1lXShwYXJhbWV0ZXJzKTtcbiAgICB0aGlzLnNjcmlwdHMucHVzaChzY3JpcHQpO1xuICAgIGxldCBldmVudFR5cGVzID0gc2NyaXB0LmV2ZW50VHlwZXM7XG4gICAgZXZlbnRUeXBlcy5mb3JFYWNoKChldmVudFR5cGUpID0+IHtcbiAgICAgIHRoaXMuZXZlbnRUeXBlcy5wdXNoKGV2ZW50VHlwZSk7XG4gICAgfSk7XG4gIH1cblxuLyoqXG4gKiBBZGRzIGFuIGV2ZW50XG4gKi9cbiAgYWRkRXZlbnQoZXZ0KSB7XG4gICAgdGhpcy5ldmVudHMucHVzaChldnQpO1xuICB9XG5cbi8qKlxuICogQWRkcyBhIHJlY3RhbmdsZSBncmFwaGljIHRvIGVudGl0eS5cbiAqIEBwYXJhbSB7bnVtYmVyfSBjb2xvciAgQW4gcmdiIGNvbG9yIChoZXgpXG4gKiBAcGFyYW0ge251bWJlcn0gd2lkdGggIFdpZHRoIG9mIGJveFxuICogQHBhcmFtIHtudW1iZXJ9IGhlaWdodCBIZWlnaHQgb2YgYm94XG4gKi9cbiAgYWRkQm94KGNvbG9yLCB3aWR0aCwgaGVpZ2h0KSB7XG4gICAgbGV0IGdyYXBoaWNzID0gbmV3IFBJWEkuR3JhcGhpY3MoKTtcbiAgICBncmFwaGljcy5iZWdpbkZpbGwoY29sb3IpO1xuICAgIGdyYXBoaWNzLmRyYXdSZWN0KDAsIDAsIHdpZHRoLCBoZWlnaHQpO1xuICAgIGdyYXBoaWNzLnBpdm90ID0ge1xuICAgICAgeDogd2lkdGgvMixcbiAgICAgIHk6IGhlaWdodC8yXG4gICAgfTtcblxuICAgIHRoaXMuYWRkQ2hpbGQoZ3JhcGhpY3MpO1xuICB9XG4vKipcbiAqIEFkZHMgYSBjaXJjbGUgZ3JhcGhpYyB0byBlbnRpdHkuXG4gKiBAcGFyYW0ge251bWJlcn0gY29sb3IgIEFuIHJnYiBjb2xvciAoaGV4KVxuICogQHBhcmFtIHtudW1iZXJ9IHJhZGl1cyBSYWRpdXMgb2YgY2lyY2xlXG4gKi9cbiAgYWRkQ2lyY2xlKGNvbG9yLCByYWRpdXMpIHtcbiAgICBsZXQgZ3JhcGhpY3MgPSBuZXcgUElYSS5HcmFwaGljcygpO1xuICAgIGdyYXBoaWNzLmJlZ2luRmlsbChjb2xvcik7XG4gICAgZ3JhcGhpY3MuZHJhd0NpcmNsZSgwLCAwLCByYWRpdXMpO1xuXG4gICAgdGhpcy5hZGRDaGlsZChncmFwaGljcyk7XG4gIH1cblxuLyoqXG4gKiBBZGRzIGEgcG9seWdvbiBncmFwaGljIHRvIGVudGl0eVxuICogQHBhcmFtIHtbdHlwZV19IGNvbG9yICAgIEFuIHJnYiBjb2xvciAoaGV4KVxuICogQHBhcmFtIHtbdHlwZV19IHZlcnRpY2VzIEEgbGlzdCBvZiB2ZXJ0aWNlcyB0aGF0IGRlZmluZSB0aGUgcG9seWdvbiAoQ0NXXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZGluZykuXG4gKi9cbiAgYWRkUG9seWdvbihjb2xvciwgdmVydGljZXMpIHtcbiAgICBsZXQgZ3JhcGhpY3MgPSBuZXcgUElYSS5HcmFwaGljcygpO1xuICAgIGdyYXBoaWNzLmJlZ2luRmlsbChjb2xvcik7XG4gICAgZ3JhcGhpY3MuZHJhd1BvbHlnb24odGhpcy5jb25zdHJ1Y3RQaXhpUG9seWdvbih2ZXJ0aWNlcywge3g6IDAsIHk6IDB9KSk7XG5cbiAgICB0aGlzLmFkZENoaWxkKGdyYXBoaWNzKTtcbiAgfVxuXG4vKipcbiAqIEFkZHMgYSBzcHJpdGUgdG8gZW50aXR5XG4gKiBAcGFyYW0ge1N0cmluZ30gc3ByaXRlTmFtZSBOYW1lIG9mIHNwcml0ZSB0byBhZGQgKGZpbGVuYW1lIHdpdGhvdXQgcGF0aCBvclxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgZXh0ZW5zaW9uKS5cbiAqL1xuICBzZXRTcHJpdGUoc3ByaXRlTmFtZSl7XG4gICAgaWYgKCF0aGlzLnNwcml0ZSkge1xuICAgICAgdGhpcy5zcHJpdGUgPSBuZXcgUElYSS5TcHJpdGUoKTtcbiAgICAgIHRoaXMuc3ByaXRlLmFuY2hvciA9IHtcbiAgICAgICAgeDogMC41LFxuICAgICAgICB5OiAwLjVcbiAgICAgIH07XG4gICAgICB0aGlzLmFkZENoaWxkKHRoaXMuc3ByaXRlKTtcbiAgICB9XG4gICAgdGhpcy5zcHJpdGUudGV4dHVyZSA9IHJlc291cmNlcy5zcHJpdGUudGV4dHVyZXNbc3ByaXRlTmFtZV07XG4gIH1cblxuLyoqXG4gKiBBZGRzIGJvZHkgYW5kIGZpeHR1cmUgZGVmaW5pdGlvbnMgdG8gdGhlIGVudGl0eS4gQSBib2R5IGFuZCBmaXh0dXJlIGFyZVxuICogY3JlYXRlZCBvbiB0aGUgbmV4dCBwaHlzaWNzIHVwZGF0ZS5cbiAqIEBwYXJhbSB7U3RyaW5nKX0gYm9keVR5cGUgVHlwZSBvZiBib2R5IHRvIGFkZCAoY2lyY2xlLCByZWN0YW5nbGUsIHBvbHlnb24pXG4gKiBAcGFyYW0ge09iamVjdH0gIG9wdGlvbnMgIEFueSBwaHlzaWNzIG9wdGlvbnMgdG8gdXNlIHRvIGJ1aWxkIGJvZHkgYW5kXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpeHR1cmUgZGVmaW5pdGlvbnMuXG4gKi9cbiAgYWRkUGh5c2ljcyhib2R5VHlwZSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgbGV0IGJvZHlEZWYgPSBuZXcgYjJCb2R5RGVmKCk7XG4gICAgbGV0IGZpeERlZiA9IG5ldyBiMkZpeHR1cmVEZWYoKTtcbiAgICBsZXQgd2lkdGggPSBvcHRpb25zLndpZHRoO1xuICAgIGxldCBoZWlnaHQgPSBvcHRpb25zLmhlaWdodDtcbiAgICBsZXQgcmFkaXVzID0gd2lkdGggLyAyLjA7XG4gICAgbGV0IHggPSBvcHRpb25zLng7XG4gICAgbGV0IHkgPSBvcHRpb25zLnk7XG4gICAgbGV0IHBvcyA9IG5ldyBCb3gyRC5iMlZlYzIoXG4gICAgICBvcHRpb25zLnggLyBjZmcucGh5c2ljc1NjYWxlICxcbiAgICAgIG9wdGlvbnMueSAvIGNmZy5waHlzaWNzU2NhbGVcbiAgICApO1xuICAgIGxldCBzaGFwZSA9IHt9O1xuXG4gICAgc3dpdGNoIChib2R5VHlwZSkge1xuICAgICAgY2FzZSAnY2lyY2xlJzpcbiAgICAgICAgc2hhcGUgPSBuZXcgYjJDaXJjbGVTaGFwZShyYWRpdXMpO1xuICAgICAgICBzaGFwZS5zZXRfbV9yYWRpdXMocmFkaXVzIC8gY2ZnLnBoeXNpY3NTY2FsZSk7XG4gICAgICAgIGlmIChvcHRpb25zLnJlbmRlcikge1xuICAgICAgICAgIHRoaXMuYWRkQ2lyY2xlKHRoaXMuY29sbGlkZXJfY29sb3IsIHdpZHRoLzIpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAncmVjdGFuZ2xlJzpcbiAgICAgICAgc2hhcGUgPSBuZXcgYjJQb2x5Z29uU2hhcGUoKTtcbiAgICAgICAgc2hhcGUuU2V0QXNCb3goXG4gICAgICAgICAgd2lkdGggLyBjZmcucGh5c2ljc1NjYWxlIC8gMixcbiAgICAgICAgICBoZWlnaHQgLyBjZmcucGh5c2ljc1NjYWxlIC8gMlxuICAgICAgICApO1xuICAgICAgICBpZiAob3B0aW9ucy5yZW5kZXIpIHtcbiAgICAgICAgICB0aGlzLmFkZEJveCh0aGlzLmNvbGxpZGVyX2NvbG9yLCB3aWR0aCwgaGVpZ2h0KTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3BvbHlnb24nOlxuICAgICAgICBsZXQgdmVydHMgPSB0aGlzLmNyZWF0ZUJveDJEVmVydGljZXMob3B0aW9ucy5wb2x5Z29uKTtcbiAgICAgICAgc2hhcGUgPSBjcmVhdGVQb2x5Z29uU2hhcGUoIHZlcnRzICk7XG4gICAgICAgIGlmIChvcHRpb25zLnJlbmRlcikge1xuICAgICAgICAgIHRoaXMuYWRkUG9seWdvbih0aGlzLmNvbGxpZGVyX2NvbG9yLCBvcHRpb25zLnBvbHlnb24pO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBpZiAob3B0aW9ucy50cmVhdG1lbnQgIT09ICdzdGF0aWMnKSB7XG4gICAgICBib2R5RGVmLnNldF90eXBlKEJveDJELmIyX2R5bmFtaWNCb2R5KTtcbiAgICAgIGJvZHlEZWYuc2V0X2xpbmVhckRhbXBpbmcob3B0aW9ucy5kYW1waW5nIHx8IDAuMCk7XG4gICAgICBib2R5RGVmLnNldF9hbmd1bGFyRGFtcGluZyhvcHRpb25zLmFuZ3VsYXJEYW1waW5nIHx8IDAuMSk7XG4gICAgfVxuICAgIGJvZHlEZWYuc2V0X3Bvc2l0aW9uKHBvcyk7XG5cblxuICAgIGZpeERlZi5zZXRfZGVuc2l0eShvcHRpb25zLmRlbnNpdHkgfHwgMS4wKTtcbiAgICBmaXhEZWYuc2V0X2ZyaWN0aW9uKG9wdGlvbnMuZnJpY3Rpb24gfHwgMC41KTtcbiAgICBmaXhEZWYuc2V0X3Jlc3RpdHV0aW9uKG9wdGlvbnMucmVzdGl0dXRpb24gfHwgMC4yKTtcbiAgICBmaXhEZWYuc2V0X3NoYXBlKHNoYXBlKTtcbiAgICBpZiAob3B0aW9ucy5jb2xsaXNpb25GaWx0ZXIpIHtcbiAgICAgIGZpeERlZi5zZXRfZmlsdGVyKDEpO1xuICAgIH1cblxuXG4gICAgdGhpcy5waHlzaWNzID0ge1xuICAgICAgaW5Xb3JsZDogZmFsc2UsXG4gICAgICBib2R5RGVmOiBib2R5RGVmLFxuICAgICAgZml4RGVmOiBmaXhEZWZcbiAgICB9O1xuICB9XG5cbiAgLypcbiAgICBVbnBhY2tzIGVudGl0eSBmcm9tIGNvbmZpZ3VyYXRpb24gZmlsZS4gTG9hZHMgY29uZmlnXG4gICAgQ29uZmlnIGZvcm1hdDpcbiAgICAgIC0gY29tcG9uZW50X2RhdGFcbiAgICAgICAgLSBXaWxsIGdvIHN0cmFpZ2h0IHRvIGVudGl0eS5cbiAgICAgICAgICBVc2VmdWwgd2hlbiBkZWZpbmluZyBjb21wb25lbnRzIHRoYXQgZG9udCBuZWVkIHRoZWlyIG93biBjb25maWcgZmlsZXNcbiAgICAgIC0gY29tcG9uZW50X2NvbmZpZ3VyYXRpb25cbiAgICAgICAgLSBIb2xkcyBhIGhhbmRsZSBmb3IgY29uZmlnIGZpbGUgdGhhdCBob2xkcyB0aGUgYWN0dWFsIGRhdGEuXG4gICAgICAgICAgVXNlZnVsIHdoZW4gYWN0dWFsIGNvbXBvbmVudCBkYXRhIGlzIGluIGFub3RoZXIgZmlsZS4gTGlrZSBhbmltYXRpb25zLlxuICAgIENyZWF0ZSBlbnRpdHkgd2l0aCB0aGlzIGFuZCBzZWUgaXRzIHN0cnVjdHVyZSBmb3IgbW9yZSBpbmZvLlxuICAqL1xuICBzdGF0aWMgZnJvbUNvbmZpZyhjb25maWdOYW1lKSB7XG4gICAgcmV0dXJuIEVudGl0eS5mcm9tQ29uZmlnT2JqKHJlc291cmNlc1tjb25maWdOYW1lXS5kYXRhKTtcbiAgfVxuXG4gIHN0YXRpYyBmcm9tQ29uZmlnT2JqKGNvbmZpZykge1xuICAgIGNvbnN0IGVudCA9IG5ldyBFbnRpdHkoKTtcblxuICAgIC8vIEFzc2lnbiBjb21wb25lbnRfZGF0YSB0byBlbnRpdHlcbiAgICBPYmplY3QuYXNzaWduKGVudCwgY29uZmlnLmNvbXBvbmVudF9kYXRhKTtcblxuICAgIC8vIEdldCBlYWNoIGNvbXBvbmVudF9jb25maWd1cmF0aW9uIGFuZCBzZXQgdGhlbSB0byBlbnRpdHlcbiAgICBjb25zdCBjb21wQ29uZiA9IGNvbmZpZy5jb21wb25lbnRfY29uZmlndXJhdGlvbjtcbiAgICBPYmplY3Qua2V5cyhjb21wQ29uZikuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgZW50W2tleV0gPSByZXNvdXJjZXNbY29tcENvbmZba2V5XV0uZGF0YTtcbiAgICB9KTtcblxuICAgIGNvbnN0IHBoeXNpY3MgPSBjb25maWcucGh5c2ljcztcbiAgICBpZiAocGh5c2ljcykge1xuICAgICAgZW50LmFkZFBoeXNpY3MocGh5c2ljcy5ib2R5VHlwZSwgcGh5c2ljcy5vcHRpb25zKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKGNvbmZpZy5wb3NpdGlvbikge1xuICAgICAgICBlbnQucG9zaXRpb24gPSBjb25maWcucG9zaXRpb247XG4gICAgICB9XG4gICAgICAvLyBlbnQucG9zaXRpb24ueCA9IGNvbmZpZy5wb3NpdGlvbi54O1xuICAgICAgLy8gbG9nLmRlYnVnKGVudC5wb3NpdGlvbik7XG4gICAgfVxuXG4gICAgaWYgKGNvbmZpZy5zcHJpdGUpIHtcbiAgICAgIGVudC5zZXRTcHJpdGUoY29uZmlnLnNwcml0ZSk7XG4gICAgfVxuXG4gICAgY29uc3Qgc2NyaXB0Q29uZiA9IGNvbmZpZy5zY3JpcHRzO1xuICAgIHNjcmlwdENvbmYuZm9yRWFjaChjb25mID0+IHtcbiAgICAgIGNvbnN0IG5hbWUgPSBjb25mLm5hbWU7XG4gICAgICBjb25zdCBwYXJhbXMgPSBjb25mLnBhcmFtZXRlcnMgfHwge307XG4gICAgICBlbnQuYWRkU2NyaXB0KG5hbWUsIHBhcmFtcyk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGVudDtcbiAgfVxuXG4vKipcbiAqIENvbnZlcnRzIGEgdGlsZWQgb2JqZWN0IGludG8gYW4gZW50aXR5XG4gKiBAcGFyYW0gIHtPYmplY3R9IHRpbGVkT2JqIFRpbGVkIG9iamVjdCAoZnJvbSBKU09OKVxuICogQHJldHVybiB7RW50aXR5fSAgICAgICAgICBUaGUgY3JlYXRlZCBlbnRpdHlcbiAqL1xuICBzdGF0aWMgZnJvbVRpbGVkT2JqZWN0KHRpbGVkT2JqKSB7XG4gICAgbGV0IHByb3BzID0gdGlsZWRPYmoucHJvcGVydGllcztcbiAgICBsZXQgY29uZmlnID0gcmVzb3VyY2VzW3Byb3BzLmNvbmZpZ10uZGF0YTtcblxuICAgIE9iamVjdC5hc3NpZ24oY29uZmlnLmNvbXBvbmVudF9kYXRhLCB0aWxlZE9iai5wcm9wZXJ0aWVzKTtcblxuICAgIGNvbmZpZy5jb21wb25lbnRfZGF0YS5uYW1lID0gdGlsZWRPYmoubmFtZTtcblxuICAgIGNvbmZpZy5wb3NpdGlvbiA9IHtcbiAgICAgIHg6IHRpbGVkT2JqLnggKyB0aWxlZE9iai53aWR0aC8yLFxuICAgICAgeTogdGlsZWRPYmoueSArIHRpbGVkT2JqLmhlaWdodC8yXG4gICAgfVxuXG4gICAgaWYgKGNvbmZpZy5waHlzaWNzKSB7XG4gICAgICBjb25maWcucGh5c2ljcy5vcHRpb25zLnggPSB0aWxlZE9iai54ICsgdGlsZWRPYmoud2lkdGgvMjtcbiAgICAgIGNvbmZpZy5waHlzaWNzLm9wdGlvbnMueSA9IHRpbGVkT2JqLnkgKyB0aWxlZE9iai5oZWlnaHQvMjtcbiAgICAgIGNvbmZpZy5waHlzaWNzLm9wdGlvbnMud2lkdGggPSB0aWxlZE9iai53aWR0aDtcbiAgICAgIGNvbmZpZy5waHlzaWNzLm9wdGlvbnMuaGVpZ2h0ID0gdGlsZWRPYmouaGVpZ2h0O1xuICAgICAgY29uZmlnLnBoeXNpY3Mub3B0aW9ucy5yYWRpdXMgPSB0aWxlZE9iai53aWR0aC8yO1xuICAgICAgaWYgKHRpbGVkT2JqLnBvbHlnb24pIHtcbiAgICAgICAgY29uZmlnLnBoeXNpY3Mub3B0aW9ucy5wb2x5Z29uID0gdGlsZWRPYmoucG9seWdvbjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBsZXQgZW50ID0gRW50aXR5LmZyb21Db25maWdPYmooY29uZmlnKTtcbiAgICByZXR1cm4gZW50O1xuICB9XG59XG5cbmV4cG9ydCB7RW50aXR5fTtcbiIsImltcG9ydCB7bG9nfSBmcm9tICdMb2cnO1xuaW1wb3J0IHtTY3JpcHRTeXN0ZW19IGZyb20gJ1N5c3RlbXMvU2NyaXB0U3lzdGVtJztcbmltcG9ydCB7RXZlbnRTeXN0ZW19IGZyb20gJ1N5c3RlbXMvRXZlbnRTeXN0ZW0nO1xuaW1wb3J0IHtQaHlzaWNzU3lzdGVtfSBmcm9tICdTeXN0ZW1zL1BoeXNpY3NTeXN0ZW0nO1xuaW1wb3J0IHtFbnRpdHl9IGZyb20gJ0VudGl0eSc7XG5pbXBvcnQge1NjcmlwdHN9IGZyb20gJ1NjcmlwdHMvU2NyaXB0cyc7XG5pbXBvcnQge0V2ZW50TWFufSBmcm9tICdNYW5hZ2Vycy9FdmVudE1hbmFnZXInO1xuaW1wb3J0IHtyZXNvdXJjZXN9IGZyb20gJ01hbmFnZXJzL1Jlc291cmNlTWFuYWdlcic7XG5pbXBvcnQgY2ZnIGZyb20gJ2NvbmZpZy5qc29uJztcblxuY2xhc3MgR2FtZSB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIC8vIFRoZSBzdGFnZSBpcyB0aGUgdG9wbW9zdCBjb250YWluZXIgZm9yIGFsbCBvZiB0aGUgZ2FtZSdzIGVudGl0aWVzXG4gICAgdGhpcy5zdGFnZSA9IG5ldyBFbnRpdHkoKTtcbiAgICAvLyBUaGUgd29ybGQgcmVwcmVzZW50cyB0aGUgZ2FtZSB3b3JsZFxuICAgIHRoaXMud29ybGQgPSBuZXcgRW50aXR5LmZyb21Db25maWcoJ2VudGl0eV93b3JsZCcpO1xuICAgIC8vIFRoZSBVSSBjb25zaXN0cyBvZiB1bm1vdmluZyBlbnRpdGllc1xuICAgIHRoaXMudWkgPSBuZXcgRW50aXR5KCk7IC8vbmV3IEVudGl0eSgnZW50aXR5X3VpJyk7XG5cbiAgICB0aGlzLnN0YWdlLmFkZENoaWxkKHRoaXMudWkpO1xuICAgIHRoaXMuc3RhZ2UuYWRkQ2hpbGQodGhpcy53b3JsZCk7XG5cbiAgICAvLyBBZGQgc3lzdGVtc1xuICAgIHRoaXMuc3lzdGVtcyA9IFtdO1xuICAgIGxldCBwaHlzaWNzU3lzdGVtID0gbmV3IFBoeXNpY3NTeXN0ZW0oKTtcbiAgICB0aGlzLnN5c3RlbXMucHVzaChwaHlzaWNzU3lzdGVtKTtcblxuICAgIGxldCBzY3JpcHRTeXN0ZW0gPSBuZXcgU2NyaXB0U3lzdGVtKCk7XG4gICAgdGhpcy5zeXN0ZW1zLnB1c2goc2NyaXB0U3lzdGVtKTtcblxuICAgIGxldCBldmVudFN5c3RlbSA9IG5ldyBFdmVudFN5c3RlbSgpO1xuICAgIHRoaXMuc3lzdGVtcy5wdXNoKGV2ZW50U3lzdGVtKTtcblxuICAgIC8vIExvYWQgbGV2ZWxcbiAgICB0aGlzLmFkZEVudGl0eVRvV29ybGQodGhpcy5sb2FkTWFwKCd0ZXN0bWFwJykpO1xuICAgIC8vIGlmIChjZmcuZGVidWdNb2RlKSB0aGlzLmRlYnVnQ29uc3RydWN0b3IoKTtcblxuICAgIC8vIEluaXRpYWxpemUgYWxsIGVudGl0aWVzXG4gICAgdGhpcy5zdGFnZS5pbml0KHRoaXMuc3RhZ2UpO1xuICAgIC8vIEluaXRpYWxpemUgYWxsIHN5c3RlbXNcbiAgICB0aGlzLnN5c3RlbXMuZm9yRWFjaCgoc3lzdGVtKSA9PiB7XG4gICAgICBzeXN0ZW0uaW5pdCh0aGlzLnN0YWdlKTtcbiAgICB9KTtcbiAgfVxuXG4vKipcbiAqIE1ldGhvZCBmb3IgY3JlYXRpbmcgYW5kIGFkZGluZyB0ZXN0IGVudGl0aWVzIHRvIHRoZSBnYW1lLlxuICovXG4gIGRlYnVnQ29uc3RydWN0b3IoKSB7XG4gICAgLy8gdGhpcy5hZGRFbnRpdHlUb1dvcmxkKHRoaXMubG9hZE1hcCgndGVzdG1hcCcpKTtcbiAgICBsb2cuZGVidWcoXCJTdGFydGluZyBkZWJ1ZyBjb25zdHJ1Y3RvclwiKTtcbiAgICBsZXQgdGVzdEVudGl0eSA9IEVudGl0eS5mcm9tQ29uZmlnKCdlbnRpdHlfcGxheWVyJyk7XG4gICAgbG9nLmRlYnVnKFwiQ3JlYXRlZCBmcm9tIGNvbmZpZ1wiKTtcbiAgICB0ZXN0RW50aXR5LnNldFNwcml0ZSgnZGVidWdfMicpO1xuICAgIHRlc3RFbnRpdHkuYWRkU2NyaXB0KCdpbnB1dFNjcmlwdCcsIHthOiAnYicsIGM6ICdkJ30pO1xuICAgIGxvZy5kZWJ1ZyhcIkFkZGVkIHNjcmlwdFwiKTtcbiAgICB0ZXN0RW50aXR5LmFkZFBoeXNpY3MoJ3JlY3RhbmdsZScsIHtcbiAgICAgIHg6IDAsXG4gICAgICB5OiAwLFxuICAgICAgdng6IDAuMDEsXG4gICAgICB3aWR0aDogNjQsXG4gICAgICBoZWlnaHQ6IDY0XG4gICAgfSk7XG4gICAgbG9nLmRlYnVnKFwiQWRkZWQgcGh5c2ljc1wiKTtcbiAgICBsb2cuZGVidWcodGVzdEVudGl0eSk7XG4gICAgdGhpcy5hZGRFbnRpdHlUb1dvcmxkKHRlc3RFbnRpdHkpO1xuXG4gIH1cblxuLyoqXG4gKiBBZGRzIGFuIGVudGl0eSB0byB0aGUgZ2FtZSB3b3JsZFxuICogQHBhcmFtIHtFbnRpdHl9IGVudGl0eSBUaGUgZW50aXR5IHRvIGFkZFxuICovXG4gIGFkZEVudGl0eVRvV29ybGQoZW50aXR5KSB7XG4gICAgdGhpcy53b3JsZC5hZGRDaGlsZChlbnRpdHkpO1xuICB9XG5cbi8qKlxuICogQWRkcyBhbiBlbnRpdHkgdG8gdGhlIFVJXG4gKiBAcGFyYW0ge0VudGl0eX0gZW50aXR5IFRoZSBlbnRpdHkgdG8gYWRkXG4gKi9cbiAgYWRkRW50aXR5VG9VSShlbnRpdHkpIHtcbiAgICB0aGlzLnVpLmFkZENoaWxkKGVudGl0eSk7XG4gIH1cblxuLyoqXG4gKiBSdW5zIGFsbCBlbnRpdGllcyB0aHJvdWdoIGFsbCBzeXN0ZW1zLlxuICogQHBhcmFtICB7bnVtYmVyfSBkZWx0YSBUaW1lIHNpbmNlIGxhc3QgdXBkYXRlXG4gKi9cbiAgdXBkYXRlKGRlbHRhKSB7XG4gICAgdGhpcy5zeXN0ZW1zLmZvckVhY2goKHN5c3RlbSkgPT4ge1xuICAgICAgc3lzdGVtLnVwZGF0ZSh0aGlzLndvcmxkLCBkZWx0YSk7XG4gICAgICBzeXN0ZW0udXBkYXRlKHRoaXMudWksIGRlbHRhKTtcbiAgICB9KTtcbiAgfVxuXG4vKipcbiAqIFJlbmRlcnMgYWxsIHJlbmRlcmFibGUgZW50aXRpZXMuXG4gKi9cbiAgcmVuZGVyKHJlbmRlcmVyKSB7XG4gICAgdGhpcy5zdGFnZS5zY2FsZS54ID0gY2ZnLndpZHRoU2NhbGU7XG4gICAgdGhpcy5zdGFnZS5zY2FsZS55ID0gY2ZnLndpZHRoU2NhbGU7XG4gICAgLy8gbG9nLmRlYnVnKGNmZy53aWR0aFNjYWxlKTtcbiAgICByZW5kZXJlci5yZW5kZXIodGhpcy5zdGFnZSk7XG4gIH1cblxuLyoqXG4gKiBMb2FkcyBhIFRpbGVkIG1hcCBpbnRvIHRoZSBnYW1lIHdvcmxkIGFuZCB1aVxuICpcbiAqIEBwYXJhbSAge1N0cmluZ30gbWFwbmFtZSBOYW1lIG9mIHRoZSBtYXAgKHdpdGhvdXQgcGF0aCBvciBleHRlbnNpb24pXG4gKi9cbiAgbG9hZE1hcChtYXBuYW1lKSB7XG4gICAgY29uc29sZS5sb2cocmVzb3VyY2VzKTtcbiAgICAvLyBsZXQgYSA9IHJlc291cmNlc1ttYXBuYW1lXS5kYXRhLnByb3BlcnRpZXMuY29uZmlnXG4gICAgLy8gY29uc29sZS5sb2coYSk7XG4gICAgbGV0IGVNYXAgPSBuZXcgRW50aXR5KCk7IC8vRW50aXR5LmZyb21Db25maWcoYSk7XG4gICAgbG9nLmRlYnVnKG1hcG5hbWUpO1xuICAgIHJlc291cmNlc1ttYXBuYW1lXS5kYXRhLmxheWVycy5mb3JFYWNoKGxheWVyID0+IHtcbiAgICAgIGxldCBlTGF5ZXIgPSBuZXcgRW50aXR5KCk7XG4gICAgICAvLyBjb25zb2xlLmxvZyhsYXllcik7XG4gICAgICBpZiAobGF5ZXIudHlwZSA9PT0gJ2ltYWdlbGF5ZXInKXtcbiAgICAgICAgbGV0IGltYWdlbmFtZSA9IGxheWVyLmltYWdlLnNwbGl0KCcuJylbMF07XG4gICAgICAgIGxldCBzcHJpdGUgPSBuZXcgUElYSS5TcHJpdGUoKTtcbiAgICAgICAgc3ByaXRlLnRleHR1cmUgPSByZXNvdXJjZXNbaW1hZ2VuYW1lXS50ZXh0dXJlO1xuICAgICAgICBlTGF5ZXIucG9zaXRpb24ueCA9IGxheWVyLm9mZnNldHggfHwgMDtcbiAgICAgICAgZUxheWVyLnBvc2l0aW9uLnkgPSBsYXllci5vZmZzZXR5IHx8IDA7XG4gICAgICAgIGVMYXllci5hZGRDaGlsZChzcHJpdGUpO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAobGF5ZXIudHlwZSA9PT0gJ29iamVjdGdyb3VwJyl7XG4gICAgICAgIGxheWVyLm9iamVjdHMuZm9yRWFjaChvYmogPT4ge1xuICAgICAgICAgIGxldCBlT2JqID0gRW50aXR5LmZyb21UaWxlZE9iamVjdChvYmopO1xuICAgICAgICAgIGVMYXllci5hZGRDaGlsZChlT2JqKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBlTWFwLmFkZENoaWxkKGVMYXllcik7XG4gICAgfSk7XG4gICAgbG9nLmRlYnVnKGVNYXApO1xuICAgIHJldHVybiBlTWFwO1xuICB9XG59XG5cbmV4cG9ydCB7R2FtZX07XG4iLCJpbXBvcnQgY2ZnIGZyb20gJ2NvbmZpZy5qc29uJztcblxuLyoqXG4gKiBUaGlzIGlzIGEgdXRpbGl0eSBmaWxlIGZvciBsb2dnaW5nLlxuICovXG5cbmNvbnN0IGxldmVscyA9IG5ldyBNYXAoW1xuICBbMSwgWydERUJVRycsICdjb2xvcjogIzIyQUEyMjsnXV0sXG4gIFsyLCBbJ0lORk8gJywgJ2NvbG9yOiAjMjIyMkFBOyddXSxcbiAgWzMsIFsnV0FSTiAnLCAnY29sb3I6ICNDQzg4MjI7J11dLFxuICBbNCwgWydFUlJPUicsICdjb2xvcjogI0RENDQyMjsnXV0sXG4gIFs1LCBbJ0ZBVEFMJywgJ2NvbG9yOiAjRkYwMDAwOyddXVxuXSk7XG5cbmZ1bmN0aW9uIHByaW50KG1zZz0nJywgbGV2ZWw9MSl7XG4gIGxldmVsID0gTWF0aC5tYXgoMSwgTWF0aC5taW4oNSwgbGV2ZWwpKTtcbiAgaWYobGV2ZWwgPj0gY2ZnLmxvZ0xldmVsKXtcbiAgICBjb25zdCBwcm9wID0gbGV2ZWxzLmdldChsZXZlbCk7XG4gICAgY29uc29sZS5sb2coYCVjWyR7cHJvcFswXX1dOmAsIHByb3BbMV0sIG1zZyk7XG4gIH1cbn1cblxuY29uc3QgbG9nID0ge1xuICBkZWJ1ZzogKG1zZykgPT4geyBwcmludChtc2csIDEpOyB9LFxuICBpbmZvOiAgKG1zZykgPT4geyBwcmludChtc2csIDIpOyB9LFxuICB3YXJuOiAgKG1zZykgPT4geyBwcmludChtc2csIDMpOyB9LFxuICBlcnJvcjogKG1zZykgPT4geyBwcmludChtc2csIDQpOyB9LFxuICBmYXRhbDogKG1zZykgPT4geyBwcmludChtc2csIDUpOyB9LFxuICBwcmludDogcHJpbnQsXG4gIHRlc3Q6IHRlc3Rcbn07XG5cbmZ1bmN0aW9uIHRlc3QoKXtcbiAgbG9nLmRlYnVnKCdkZWJ1ZyBtc2cnKTtcbiAgbG9nLmluZm8oJ2luZm8gbXNnJyk7XG4gIGxvZy53YXJuKCd3YXJuIG1zZycpO1xuICBsb2cuZXJyb3IoJ2Vycm9yIG1zZycpO1xuICBsb2cuZmF0YWwoJ2ZhdGFsIG1zZycpO1xufVxuZXhwb3J0IHtsb2d9O1xuIiwiaW1wb3J0IHtJbnB1dE1hbn0gZnJvbSAnTWFuYWdlcnMvSW5wdXRNYW5hZ2VyJztcbmltcG9ydCB7RXZlbnRNYW59IGZyb20gJ01hbmFnZXJzL0V2ZW50TWFuYWdlcic7XG5pbXBvcnQge0F1ZGlvTWFufSBmcm9tICdNYW5hZ2Vycy9BdWRpb01hbmFnZXInO1xuaW1wb3J0IHtSZXNvdXJjZU1hbn0gZnJvbSAnTWFuYWdlcnMvUmVzb3VyY2VNYW5hZ2VyJztcblxuaW1wb3J0IHtyZXNvdXJjZXN9IGZyb20gJ01hbmFnZXJzL1Jlc291cmNlTWFuYWdlcic7XG5pbXBvcnQge1NjcmlwdHN9IGZyb20gJ1NjcmlwdHMvU2NyaXB0cyc7XG5pbXBvcnQge0VudGl0eX0gZnJvbSAnRW50aXR5JztcbmltcG9ydCB7R2FtZX0gZnJvbSAnR2FtZSc7XG5pbXBvcnQge2xvZ30gZnJvbSAnTG9nJztcblxuaW1wb3J0IGNmZyBmcm9tICdjb25maWcuanNvbic7XG5cbmNvbnN0ICQgPSBqUXVlcnk7XG5cbiQoIGRvY3VtZW50ICkucmVhZHkoKCkgPT4ge1xuICBjb25zdCBlbCA9ICQoY2ZnLmNvbnRhaW5lcik7XG5cblxuICAvLyBQaXhpIHNldHVwXG4gIFBJWEkudXRpbHMuX3NhaWRIZWxsbyA9IHRydWU7IC8vIEtlZXAgY29uc29sZSBjbGVhblxuICAvLyBQSVhJLlNDQUxFX01PREVTLkRFRkFVTFQgPSBQSVhJLlNDQUxFX01PREVTLk5FQVJFU1Q7XG5cbiAgLy8gUmVuZGVyZXJcbiAgY29uc3QgcmVkT3B0ID0gY2ZnLnJlbmRlcmVyLm9wdGlvbnM7XG4gIHJlZE9wdC5yZXNvbHV0aW9uID0gd2luZG93LmRldmljZVBpeGVsUmF0aW8gfHwgMTtcbiAgY2ZnLnJlc29sdXRpb24gPSB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyB8fCAxO1xuICBjb25zdCByYXRpbyA9IGNmZy5yZW5kZXJlci5zaXplLnkgLyBjZmcucmVuZGVyZXIuc2l6ZS54XG4gIGNmZy53aWR0aFNjYWxlID0gZWwud2lkdGgoKSAvIGNmZy5yZW5kZXJlci5zaXplLnggLyByZWRPcHQucmVzb2x1dGlvbjtcbiAgY2ZnLmlucHV0UmVzID0gZWwud2lkdGgoKSAvIGNmZy5yZW5kZXJlci5zaXplLng7XG5cbiAgY29uc3QgcmVuZGVyZXIgPSBQSVhJLmF1dG9EZXRlY3RSZW5kZXJlcihlbC53aWR0aCgpIC8gKHJlZE9wdC5yZXNvbHV0aW9uKSwgZWwud2lkdGgoKSAqIHJhdGlvIC8gKHJlZE9wdC5yZXNvbHV0aW9uKSwgcmVkT3B0KTtcbiAgcmVuZGVyZXIuYmFja2dyb3VuZENvbG9yID0gMHgwMDAwMDA7XG5cbiAgLy8gTWFuYWdlcnNcbiAgLyogVE9ETzogRmlndXJlIG91dCB3YXkgdG8gcHJpb3JpdGl6ZSBtYW5hZ2VyIGluaXQuXG4gIE5vdyByZXNtYW4gaW5pdCBpcyBjYWxsZWQgYmVmb3JlIGFueXRoaW5nIGVsc2UgbWFudWFsbHkuXG4gIEx1Y2tpbHksIHJlc21hbiBkb2VzIG5vdCBuZWVkIHRvIHVwZGF0ZSBpdHNlbGYuICovXG4gIGNvbnN0IG1hbmFnZXJzID0gW1xuICAgIElucHV0TWFuLFxuICAgIEV2ZW50TWFuLFxuICAgIEF1ZGlvTWFuXG4gIF07XG5cbiAgLy8gU3RhZ2VcbiAgbGV0IGdhbWU7XG5cbiAgLy8gRGVsdGEgdGltZSBmb3IgZWFjaCB1cGRhdGVcbiAgY29uc3QgbG9vcEludGVydmFsID0gMTAwMCAvIGNmZy5mcHM7XG4gIGxldCBsYXN0RnJhbWUgPSAwO1xuXG4gIC8vIE1haW4gZW50cnlcbiAgZnVuY3Rpb24gbWFpbigpIHtcbiAgICBsb2cuaW5mbyhgVGFyZ2V0IGZwczogJHtjZmcuZnBzfWApO1xuICAgIGVsLmFwcGVuZChyZW5kZXJlci52aWV3KTtcblxuICAgIFJlc291cmNlTWFuLmluaXQoKS50aGVuKCgpID0+IHtcbiAgICAgIGNvbnN0IG1hblByb21pc2VzID0gbWFuYWdlcnMubWFwKG1hbiA9PiBtYW4uaW5pdCgpKTtcblxuICAgICAgUHJvbWlzZS5hbGwobWFuUHJvbWlzZXMpLnRoZW4oZnVuY3Rpb24odmFsdWVzKSB7XG4gICAgICAgIG1hbmFnZXJzLmZvckVhY2gobWFuID0+e1xuICAgICAgICAgIEV2ZW50TWFuLnJlZ2lzdGVyTGlzdGVuZXIobWFuKTtcbiAgICAgICAgfSk7XG4gICAgICAgIC8vIEFsbCBtYW5nZXIgaW5pdHMgYXJlIGRvbmUsIHN0YXJ0IHRoZSBnYW1lIVxuICAgICAgICBpbml0UmVhZHkoKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gIH1cblxuICAvLyBSdW4gb25jZSByZXNvdXJjZXMgaGF2ZSBpbml0aWFsaXplZFxuICBmdW5jdGlvbiBpbml0UmVhZHkoKSB7XG4gICAgbG9nLmluZm8oJ0luaXRpYWxpemF0aW9uIHJlYWR5IScpO1xuICAgIC8vY29uc29sZS5jbGVhcigpOyAvLyBDbGVhcnMgdGhlIGNvbnNvbGUuXG4gICAgZ2FtZSA9IG5ldyBHYW1lKCk7XG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGxvb3ApO1xuICB9XG5cbiAgbGV0IGRlbHRhID0gMDtcbiAgZnVuY3Rpb24gbG9vcChjdGltZSkge1xuICAgIGRlbHRhICs9IGN0aW1lIC0gbGFzdEZyYW1lO1xuXG4gICAgLy8gVXNlIGNvdW50IHRvIGxpbWl0IG51bWJlciBvZiBhY2N1bXVsYXRlZCBmcmFtZXNcbiAgICBsZXQgY291bnQgPSAwO1xuICAgIHdoaWxlIChkZWx0YSA+IGxvb3BJbnRlcnZhbCAmJiBjb3VudCA8IDMpIHtcbiAgICAgIGNvdW50Kys7XG4gICAgICB1cGRhdGUobG9vcEludGVydmFsKTtcbiAgICAgIGRlbHRhIC09IGxvb3BJbnRlcnZhbDtcbiAgICAgIGRyYXcoKTtcbiAgICAgIG1hbmFnZXJzLmZvckVhY2goKG1hbikgPT4ge1xuICAgICAgICBtYW4udXBkYXRlKCk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgaWYgKGNvdW50ID09IDMpIHtcbiAgICAgIGRlbHRhID0gMDtcbiAgICB9XG4gICAgbGFzdEZyYW1lID0gY3RpbWU7XG5cbiAgICAvLyBpZihjdGltZSAtIGxhc3RGcmFtZSA+IGxvb3BJbnRlcnZhbCkge1xuICAgIC8vICAgbGFzdEZyYW1lID0gY3RpbWU7XG4gICAgLy8gICB1cGRhdGUoZGVsdGEpO1xuICAgIC8vICAgZHJhdygpO1xuICAgIC8vICAgSW5wdXQudXBkYXRlKCk7XG4gICAgLy8gICBFdmVudE1hbmFnZXIuZGVsZWdhdGVFdmVudHMoKTtcbiAgICAvLyB9XG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGxvb3ApO1xuICB9XG5cbiAgZnVuY3Rpb24gdXBkYXRlKGRlbHRhKSB7XG4gICAgZ2FtZS51cGRhdGUoZGVsdGEpO1xuICB9XG5cbiAgZnVuY3Rpb24gZHJhdygpIHtcbiAgICBnYW1lLnJlbmRlcihyZW5kZXJlcik7XG4gIH1cblxuICAvLyBTY2FsZSBnYW1lIHZpZXcgYXMgd2luZG93IGNoYW5nZXMgc2l6ZVxuICAkKCB3aW5kb3cgKS5yZXNpemUoZnVuY3Rpb24oKSB7XG4gICAgY2ZnLndpZHRoU2NhbGUgPSBlbC53aWR0aCgpIC8gY2ZnLnJlbmRlcmVyLnNpemUueCAvIHJlZE9wdC5yZXNvbHV0aW9uO1xuICAgIHJlbmRlcmVyLnJlc2l6ZShlbC53aWR0aCgpIC8gcmVkT3B0LnJlc29sdXRpb24gLCBlbC53aWR0aCgpICogcmF0aW8gLyByZWRPcHQucmVzb2x1dGlvbik7XG4gIH0pO1xuXG4gIG1haW4oKTtcbn0pO1xuIiwiXG4vKipcbiAqIFBhcmVudCBjbGFzcyBmb3IgbWFuYWdlcnMuIE1hbmFnZXJzIGNhbiBiZSB1c2VkIHRvICdtYW5hZ2UnIGFueSBzeXN0ZW0td2lkZVxuICogcmVzb3VyY2VzLiBGb3IgZXhhbXBsZSB0aGUgZXZlbnQgbWFuYWdlciBjb2xsZWN0cyBhbmQgZGlzdHJpYnV0ZXMgZXZlbnRzIHRvXG4gKiBhbnkgcmVnaXN0ZXJlZCBsaXN0ZW5lcnMuIFRoZSByZXNvdXJjZSBtYW5hZ2VyIGZhY2lsaXRhdGVzIHRoZSBsb2FkaW5nIGFuZFxuICogdXNlIG9mIGV4dGVybmFsIHJlc291cmNlcy4gXG4gKi9cbmNsYXNzIE1hbmFnZXIge1xuICBjb25zdHJ1Y3Rvcigpe1xuICAgIHRoaXMuZXZlbnRUeXBlcyA9IFtdO1xuICAgIHRoaXMuZXZlbnRzID0gW107XG4gIH1cblxuICAvLyBSdW4gYXQgZ2FtZSBpbml0LiBSZXR1cm5zIHByb21pc2UuXG4gIGluaXQoKXtcbiAgICBjb25zdCBwcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT57XG4gICAgICByZXNvbHZlKCdEZWZhdWx0IG1hbmFnZXIgaW5pdCBkb25lIScpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHByb21pc2U7XG4gIH1cblxuICAvLyBSdW4gZWFjaCBmcmFtZS5cbiAgdXBkYXRlKCl7XG4gICAgdGhpcy5oYW5kbGVFdmVudHMoKTtcbiAgfVxuXG4gIGFkZEV2ZW50KGV2dCkge1xuICAgIHRoaXMuZXZlbnRzLnB1c2goZXZ0KTtcbiAgfVxuXG4gIGhhbmRsZUV2ZW50cygpIHtcbiAgICB0aGlzLmV2ZW50cy5mb3JFYWNoKChldnQpID0+IHtcbiAgICAgIHRoaXMuaGFuZGxlU2luZ2xlRXZlbnQoZXZ0KTtcbiAgICB9KTtcbiAgICB0aGlzLmV2ZW50cyA9IFtdO1xuICB9XG5cbiAgaGFuZGxlU2luZ2xlRXZlbnQoZXZ0KSB7fVxuXG59XG5leHBvcnR7TWFuYWdlcn07XG4iLCJpbXBvcnQge2xvZ30gZnJvbSAnTG9nJztcbmltcG9ydCB7cmVzb3VyY2VzfSBmcm9tICdNYW5hZ2Vycy9SZXNvdXJjZU1hbmFnZXInO1xuaW1wb3J0IGNmZyBmcm9tICdjb25maWcuanNvbic7XG5pbXBvcnQge01hbmFnZXJ9IGZyb20gJ01hbmFnZXInO1xuXG5jbGFzcyBBdWRpb01hbmFnZXIgZXh0ZW5kcyBNYW5hZ2VyIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLmV2ZW50VHlwZXMgPSBbJ2F1ZGlvJ107XG4gICAgdGhpcy5tdXNpY2lkID0gLTE7XG4gICAgdGhpcy5zb3VuZGlkID0gLTE7XG4gIH1cblxuICBpbml0KCkge1xuICAgIGNvbnN0IHByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBsZXQgc291bmRDb25maWcgPSByZXNvdXJjZXMuc291bmRzLmRhdGE7XG5cbiAgICAgIGxldCByZWFkeSA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJlc29sdmUoJ0F1ZGlvIG1hbmFnZXIgaW5pdCBkb25lIScpO1xuICAgICAgfTtcbiAgICAgIC8vIFBhdGhzIGFyZSBqdXN0IGZpbGVuYW1lcy4gVGhpcyBhZGRzIHJlc3Qgb2YgdGhlIHBhdGhcbiAgICAgIGxldCBmaXhlZFVybHMgPSBzb3VuZENvbmZpZy51cmxzLm1hcCgoZSkgPT4gJ3Jlcy9zb3VuZHMvJyArIGUpO1xuICAgICAgdGhpcy5ob3dsID0gbmV3IEhvd2woe1xuICAgICAgICBzcmM6IGZpeGVkVXJscyxcbiAgICAgICAgc3ByaXRlOiBzb3VuZENvbmZpZy5zcHJpdGUsXG4gICAgICAgIC8vIGh0bWw1OiB0cnVlLFxuICAgICAgICBwcmVsb2FkOiB0cnVlLFxuICAgICAgICBvbmxvYWQ6IHJlYWR5XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIHJldHVybiBwcm9taXNlO1xuICB9XG5cbiAgaGFuZGxlU2luZ2xlRXZlbnQoZXZ0KSB7XG4gICAgbGV0IHNwcml0ZU5hbWUgPSBldnQucGFyYW1ldGVycy5hdWRpbztcblxuICAgIGlmKGV2dC5ldmVudFR5cGUgPT0gJ2F1ZGlvX3NvdW5kX3BsYXknKXtcbiAgICAgIGlmKHRoaXMuc291bmRpZCA+PSAwICl7XG4gICAgICAgIHRoaXMuaG93bC5zdG9wKHRoaXMuc291bmRpZCk7XG4gICAgICB9XG4gICAgICB0aGlzLnNvdW5kaWQgPSB0aGlzLmhvd2wucGxheShzcHJpdGVOYW1lKTtcbiAgICB9XG4gICAgZWxzZSBpZihldnQuZXZlbnRUeXBlID09ICdhdWRpb19tdXNpY19wbGF5Jyl7XG4gICAgICBpZih0aGlzLm11c2ljaWQgPj0gMCApe1xuICAgICAgICB0aGlzLmhvd2wuc3RvcCh0aGlzLm11c2ljaWQpO1xuICAgICAgfVxuICAgICAgdGhpcy5tdXNpY2lkID0gdGhpcy5ob3dsLnBsYXkoc3ByaXRlTmFtZSk7XG4gICAgfVxuXG4gIH1cblxufVxuY29uc3QgQXVkaW9NYW4gPSBuZXcgQXVkaW9NYW5hZ2VyKCk7XG5cbmV4cG9ydCB7QXVkaW9NYW59O1xuIiwiaW1wb3J0IHtsb2d9IGZyb20gJ0xvZyc7XG5pbXBvcnQge01hbmFnZXJ9IGZyb20gJ01hbmFnZXInO1xuXG5jbGFzcyBFdmVudE1hbmFnZXIgZXh0ZW5kcyBNYW5hZ2VyIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMubGlzdGVuZXJzID0ge1xuICAgICAgbGlzdGVuZXJzOiBbXVxuICAgIH07XG4gICAgdGhpcy5ldmVudHMgPSBbXTtcbiAgfVxuXG4gIC8vIFRPRE86IFRlc3Qgb3B0aW1pemVFdmVudFR5cGVzIG1ldGhvZFxuICBvcHRpbWl6ZUV2ZW50VHlwZXMoZXZlbnRUeXBlcykge1xuICAgIGxldCByZXN1bHRzID0gW107XG4gICAgaWYgKGV2ZW50VHlwZXMubGVuZ3RoID4gMCkge1xuICAgICAgbGV0IHNvcnRlZCA9IGV2ZW50VHlwZXMuc29ydCgpO1xuICAgICAgbGV0IGNoZWNrID0gc29ydGVkWzBdO1xuICAgICAgcmVzdWx0cy5wdXNoKGNoZWNrKTtcbiAgICAgIGZvciAobGV0IGkgPSAxOyBpIDwgc29ydGVkLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGxldCBvdGhlciA9IHNvcnRlZFtpXTtcbiAgICAgICAgbGV0IHN1YnMgPSBvdGhlci5zdWJzdHIoMCwgY2hlY2subGVuZ3RoKTtcbiAgICAgICAgaWYgKHN1YnMgIT09IGNoZWNrKSB7XG4gICAgICAgICAgY2hlY2sgPSBvdGhlcjtcbiAgICAgICAgICByZXN1bHRzLnB1c2goY2hlY2spO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzO1xuICB9XG5cbiAgcmVnaXN0ZXJMaXN0ZW5lcihsaXN0ZW5lcikge1xuICAgIGxldCBldmVudFR5cGVzID0gdGhpcy5vcHRpbWl6ZUV2ZW50VHlwZXMobGlzdGVuZXIuZXZlbnRUeXBlcyk7XG4gICAgZXZlbnRUeXBlcy5mb3JFYWNoKChldmVudFR5cGUpID0+IHtcbiAgICAgIGxldCBzID0gZXZlbnRUeXBlLnNwbGl0KCdfJyk7XG4gICAgICBsZXQgcm9vdCA9IHRoaXMubGlzdGVuZXJzO1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGxldCBrZXkgPSBzW2ldO1xuICAgICAgICBpZiAoIXJvb3Rba2V5XSkge1xuICAgICAgICAgIHJvb3Rba2V5XSA9IHtcbiAgICAgICAgICAgIGxpc3RlbmVyczogW11cbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJvb3QgPSByb290W2tleV07XG4gICAgICB9XG4gICAgICByb290Lmxpc3RlbmVycy5wdXNoKGxpc3RlbmVyKTtcbiAgICB9KTtcbiAgfVxuXG4gIHB1Ymxpc2goZXZlbnQpIHtcbiAgICB0aGlzLmV2ZW50cy5wdXNoKGV2ZW50KTtcbiAgfVxuXG4gIHVwZGF0ZSgpe1xuICAgIHRoaXMuZGVsZWdhdGVFdmVudHMoKTtcbiAgfVxuXG4gIGRlbGVnYXRlRXZlbnRzKCkge1xuICAgIHRoaXMuZXZlbnRzLmZvckVhY2goKGV2ZW50KSA9PiB7XG4gICAgICBsZXQgZXZlbnRUeXBlID0gZXZlbnQuZXZlbnRUeXBlO1xuICAgICAgbGV0IHMgPSBldmVudFR5cGUuc3BsaXQoJ18nKTtcbiAgICAgIGxldCByb290ID0gdGhpcy5saXN0ZW5lcnM7XG4gICAgICByb290Lmxpc3RlbmVycy5mb3JFYWNoKChsaXN0ZW5lcikgPT4gbGlzdGVuZXIuYWRkRXZlbnQoZXZlbnQpKTtcblxuICAgICAgY29uc3QgYWRkRXZlbnQgPSAobGlzdGVuZXIpID0+IGxpc3RlbmVyLmFkZEV2ZW50KGV2ZW50KTtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBsZXQga2V5ID0gc1tpXTtcbiAgICAgICAgaWYgKCFyb290W2tleV0pIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICByb290ID0gcm9vdFtrZXldO1xuICAgICAgICByb290Lmxpc3RlbmVycy5mb3JFYWNoKGFkZEV2ZW50KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICB0aGlzLmV2ZW50cyA9IFtdO1xuICB9XG5cbiAgLy8gVE9ETzogSW1wbGVtZW50IHJlbW92ZUxpc3RlbmVyIGluIEV2ZW50TWFuYWdlclxuICByZW1vdmVMaXN0ZW5lcigpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1JlbW92ZSBMaXN0ZW5lciBub3QgaW1wbGVtZW50ZWQhJyk7XG4gIH1cbn1cblxuY29uc3QgRXZlbnRNYW4gPSBuZXcgRXZlbnRNYW5hZ2VyKCk7XG5cbmV4cG9ydCB7RXZlbnRNYW59O1xuIiwiaW1wb3J0IGtleWNmZyBmcm9tICdrZXlzLmpzb24nO1xuaW1wb3J0IHtNYW5hZ2VyfSBmcm9tICdNYW5hZ2VyJztcbmltcG9ydCBjZmcgZnJvbSAnY29uZmlnLmpzb24nO1xuaW1wb3J0IHtsb2d9IGZyb20gJ0xvZyc7XG5cbmNvbnN0ICQgPSBqUXVlcnk7XG5cbmNsYXNzIElucHV0TWFuYWdlciBleHRlbmRzIE1hbmFnZXIge1xuICBjb25zdHJ1Y3Rvcigpe1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5rZXlEb3duID0ge307XG4gICAgdGhpcy5rZXlQcmVzc2VkID0ge307XG4gICAgdGhpcy5rZXlSZWxlYXNlZCA9IHt9O1xuICAgIHRoaXMubW91c2VQb3MgPSB7eDogMCwgeTogMH07XG4gICAgdGhpcy5tb3VzZVByZXNzZWQgPSBmYWxzZTtcbiAgICB0aGlzLm1vdXNlUmVsZWFzZWQgPSBmYWxzZTtcbiAgfVxuXG4gIGluaXQoKXtcbiAgICB0aGlzLmVsID0gJChjZmcuY29udGFpbmVyKTtcbiAgICBjb25zdCBwcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXG4gICAgICB0aGlzLmtleXMgPSBuZXcgTWFwKCBPYmplY3Qua2V5cyhrZXljZmcpLm1hcChrZXkgPT4ge1xuICAgICAgICAgIHJldHVybiBba2V5Y2ZnW2tleV0sIGtleV07XG4gICAgICAgIH0pKTtcblxuICAgICAgbGV0IGNhbnZhcyA9IHRoaXMuZWxbMF07XG5cbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgKGUpID0+IHRoaXMuc2V0S2V5U3RhdGUoZSwgdHJ1ZSksIGZhbHNlKTtcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIChlKSA9PiB0aGlzLnNldEtleVN0YXRlKGUsIGZhbHNlKSwgZmFsc2UpO1xuICAgICAgalF1ZXJ5KHdpbmRvdykubW91c2Vkb3duKChlKSA9PiB0aGlzLnNldE1vdXNlU3RhdGUoZSwgdHJ1ZSkpO1xuICAgICAgalF1ZXJ5KHdpbmRvdykubW91c2V1cCgoZSkgPT4gdGhpcy5zZXRNb3VzZVN0YXRlKGUsIGZhbHNlKSk7XG4gICAgICBqUXVlcnkod2luZG93KS5vbihcInRvdWNoc3RhcnRcIiwgKGUpID0+IHtcbiAgICAgICAgdGhpcy5zZXRNb3VzZVN0YXRlVG91Y2goZSwgdHJ1ZSlcbiAgICAgIH0pO1xuICAgICAgalF1ZXJ5KHdpbmRvdykub24oXCJ0b3VjaG1vdmVcIiwgKGUpID0+IHtcbiAgICAgICAgdGhpcy5zZXRDdXJzb3JQb3NUb3VjaChlKTtcbiAgICAgIH0pO1xuICAgICAgalF1ZXJ5KHdpbmRvdykub24oXCJ0b3VjaGVuZFwiLCAoZSkgPT4gdGhpcy5zZXRNb3VzZVN0YXRlKGUsIGZhbHNlKSk7XG4gICAgICBqUXVlcnkod2luZG93KS5iaW5kKCdtb3VzZW1vdmUnLCAoZSkgPT4gdGhpcy5zZXRDdXJzb3JQb3MoZSkpO1xuXG4gICAgICByZXNvbHZlKCdJbnB1dCBtYW5hZ2VyIGluaXQgZG9uZSEnKTtcblxuICAgIH0pO1xuICAgIHRoaXMuZWwgPSAkKGNmZy5jb250YWluZXIpO1xuICB9XG5cbiAgc2V0S2V5U3RhdGUoZXYsIHN0YXRlKSB7XG4gICAgY29uc3QgY29kZSA9IGV2LndoaWNoO1xuICAgIGNvbnN0IGtleSA9IHRoaXMua2V5cy5nZXQoY29kZSk7XG4gICAgaWYgKGtleSkgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICBpZiAodGhpcy5rZXlEb3duW2tleV0gIT0gc3RhdGUpIHtcbiAgICAgIHRoaXMua2V5RG93bltrZXldID0gc3RhdGU7XG4gICAgICBpZiAoc3RhdGUpIHtcbiAgICAgICAgdGhpcy5rZXlQcmVzc2VkW2tleV0gPSB0cnVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5rZXlSZWxlYXNlZFtrZXldID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBzZXRNb3VzZVN0YXRlKGV2LCBzdGF0ZSkge1xuICAgIGlmICh0aGlzLm1vdXNlRG93biAhPSBzdGF0ZSkge1xuICAgICAgdGhpcy5tb3VzZURvd24gPSBzdGF0ZTtcbiAgICB9XG4gICAgaWYgKHN0YXRlKSB7XG4gICAgICB0aGlzLm1vdXNlUHJlc3NlZCA9IHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMubW91c2VSZWxlYXNlZCA9IHRydWU7XG4gICAgfVxuICB9XG5cbiAgc2V0TW91c2VTdGF0ZVRvdWNoKGV2LCBzdGF0ZSkge1xuICAgIGlmICh0aGlzLm1vdXNlRG93biAhPSBzdGF0ZSkge1xuICAgICAgdGhpcy5tb3VzZURvd24gPSBzdGF0ZTtcbiAgICB9XG4gICAgdGhpcy5zZXRDdXJzb3JQb3NUb3VjaChldik7XG4gICAgaWYgKHN0YXRlKSB7XG4gICAgICB0aGlzLm1vdXNlUHJlc3NlZCA9IHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMubW91c2VSZWxlYXNlZCA9IHRydWU7XG4gICAgfVxuICB9XG5cbiAgc2V0Q3Vyc29yUG9zKGV2KSB7XG4gICAgY29uc3Qgb2ZmID0gdGhpcy5lbC5vZmZzZXQoKTtcbiAgICBjb25zdCBzID0gY2ZnLmlucHV0UmVzO1xuICAgIHRoaXMubW91c2VQb3MgPSB7XG4gICAgICB4OiBldi5wYWdlWCAvIHMgLSBvZmYubGVmdCxcbiAgICAgIHk6IGV2LnBhZ2VZIC8gcyAtIG9mZi50b3BcbiAgICB9O1xuICB9XG5cbiAgc2V0Q3Vyc29yUG9zVG91Y2goZXYpIHtcbiAgICBjb25zdCBvZmYgPSB0aGlzLmVsLm9mZnNldCgpO1xuICAgIGNvbnN0IHMgPSBjZmcuaW5wdXRSZXM7XG4gICAgY29uc3Qgb3JpZ0V2ZW50ID0gZXYub3JpZ2luYWxFdmVudDtcbiAgICB0aGlzLm1vdXNlUG9zID0ge1xuICAgICAgeDogb3JpZ0V2ZW50LnRhcmdldFRvdWNoZXNbMF0ucGFnZVggLyBzIC0gb2ZmLmxlZnQsXG4gICAgICB5OiBvcmlnRXZlbnQudGFyZ2V0VG91Y2hlc1swXS5wYWdlWSAvIHMgLSBvZmYudG9wXG4gICAgfTtcbiAgfVxuXG4gIHVwZGF0ZSgpe1xuICAgIC8qVE9ETzogRW5zdXJlIGlucHV0IHN0YXlzIGNvbnN0YW50IHRocm91Z2hvdXQgZ2FtZSB1cGRhdGUuXG4gICAgS2V5ZG93biBhbmQga2V5dXAgZXZlbnRzIHdpbGwgdHJpZ2dlciBldmVuIHdoZW4gZ2FtZSBpcyB1cGRhdGluZy4qL1xuICAgIHRoaXMua2V5UHJlc3NlZCA9IHt9O1xuICAgIHRoaXMua2V5UmVsZWFzZWQgPSB7fTtcbiAgICB0aGlzLm1vdXNlUHJlc3NlZCA9IGZhbHNlO1xuICAgIHRoaXMubW91c2VSZWxlYXNlZCA9IGZhbHNlO1xuICB9XG5cbn1cblxuY29uc3QgSW5wdXRNYW4gPSBuZXcgSW5wdXRNYW5hZ2VyKCk7XG5cbmV4cG9ydCB7SW5wdXRNYW59O1xuIiwiaW1wb3J0IHtsb2d9IGZyb20gJ0xvZyc7XG5pbXBvcnQgY2ZnIGZyb20gJ2NvbmZpZy5qc29uJztcbmltcG9ydCB7TWFuYWdlcn0gZnJvbSAnTWFuYWdlcic7XG5cbmNsYXNzIFJlc291cmNlTWFuYWdlciBleHRlbmRzIE1hbmFnZXIge1xuXG4gIGNvbnN0cnVjdG9yKCl7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLmxvYWRCYXJMZW4gPSAxMDtcbiAgICB0aGlzLmxvYWRlciA9IFBJWEkubG9hZGVyO1xuICAgIHRoaXMucmVzb3VyY2VzID0gdGhpcy5sb2FkZXIucmVzb3VyY2VzO1xuICB9XG5cbiAgaW5pdCgpe1xuICAgIGNvbnN0IHByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCByZWFkeSA9ICgpID0+IHtcbiAgICAgICAgcmVzb2x2ZSgnUmVzb3VyY2UgbWFuYWdlciBpbml0IGRvbmUhJyk7XG4gICAgICB9O1xuXG4gICAgICBjb25zdCBlcnJvciA9IChhLGIsYykgPT4ge1xuICAgICAgICBsb2cuZXJyb3IoYSk7XG4gICAgICAgIGxvZy5lcnJvcihiKTtcbiAgICAgICAgbG9nLmVycm9yKGMpO1xuICAgICAgICByZWplY3QoJ1Jlc291cmNlIG1hbmFnZXIgaW5pdCBFUlJPUiEnKTtcbiAgICAgIH07XG4gICAgICBjb25zdCBmaWxlbGlzdExvYWRlciA9IG5ldyBQSVhJLmxvYWRlcnMuTG9hZGVyKCk7XG5cbiAgICAgIE9iamVjdC5rZXlzKGNmZy5yZXNvdXJjZUxpc3RzKS5mb3JFYWNoKGtleSA9PiB7XG4gICAgICAgIGZpbGVsaXN0TG9hZGVyLmFkZChjZmcucmVzb3VyY2VMaXN0c1trZXldKTtcbiAgICAgIH0pO1xuXG4gICAgICBmaWxlbGlzdExvYWRlci5vbigncHJvZ3Jlc3MnLCAoYSxiKSA9PiB0aGlzLmxvYWRQcm9ncmVzcyhhLGIsJ0ZpbGVsaXN0JykpO1xuICAgICAgZmlsZWxpc3RMb2FkZXIub24oJ2Vycm9yJywgZXJyb3IpO1xuXG4gICAgICBmaWxlbGlzdExvYWRlci5vbmNlKCdjb21wbGV0ZScsIChsZHIsIHJlcykgPT4ge1xuXG4gICAgICAgIE9iamVjdC5rZXlzKHJlcykuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgICAgIHJlc1trZXldLmRhdGEuZm9yRWFjaChwYXRoID0+IHtcbiAgICAgICAgICAgIHRoaXMubG9hZGVyLmFkZCh0aGlzLmdldE5hbWUocGF0aCksIHBhdGgpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBjZmcuc3RhdGljUmVzb3VyY2VzLmZvckVhY2goIHBhdGggPT4ge1xuICAgICAgICAgIHRoaXMubG9hZGVyLmFkZCh0aGlzLmdldE5hbWUocGF0aCksIHBhdGgpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmxvYWRlci5vbigncHJvZ3Jlc3MnLCAoYSxiKSA9PiB0aGlzLmxvYWRQcm9ncmVzcyhhLGIsJ1Jlc291cmNlJykpO1xuICAgICAgICB0aGlzLmxvYWRlci5vbignZXJyb3InLCBlcnJvcik7XG4gICAgICAgIHRoaXMubG9hZGVyLm9uY2UoJ2NvbXBsZXRlJywgcmVhZHkpO1xuICAgICAgICB0aGlzLmxvYWRlci5sb2FkKCk7XG4gICAgICB9KTtcbiAgICAgIGZpbGVsaXN0TG9hZGVyLmxvYWQoKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBwcm9taXNlO1xuXG4gIH1cblxuICBnZXROYW1lKHBhdGgpe1xuICAgIHJldHVybiBwYXRoLnNwbGl0KCdcXFxcJykucG9wKCkuc3BsaXQoJy8nKS5wb3AoKS5zcGxpdCgnLicpWzBdO1xuICB9XG5cbiAgbG9hZFByb2dyZXNzKGxkciwgcmVzLCBoZWFkZXIpe1xuICAgIGxldCBwID0gbGRyLnByb2dyZXNzO1xuICAgIGxldCByZWFkeSA9IE1hdGguZmxvb3IodGhpcy5sb2FkQmFyTGVuICogKE1hdGguZmxvb3IocCkgLyAxMDApKTtcbiAgICBsZXQgaSA9ICc9Jy5yZXBlYXQocmVhZHkpICsgJyAnLnJlcGVhdCh0aGlzLmxvYWRCYXJMZW4gLSByZWFkeSk7XG4gICAgbGV0IHN0ciA9IGAke2hlYWRlcn0gcHJvZ3Jlc3MgWyR7aX1dICR7TWF0aC5mbG9vcihwKX0lYDtcbiAgICBsb2cuaW5mbyhzdHIpO1xuICB9XG5cbn1cblxuY29uc3QgUmVzb3VyY2VNYW4gPSBuZXcgUmVzb3VyY2VNYW5hZ2VyKCk7XG5jb25zdCByZXMgPSBSZXNvdXJjZU1hbi5yZXNvdXJjZXM7XG5cbmV4cG9ydCB7UmVzb3VyY2VNYW4sIHJlcyBhcyByZXNvdXJjZXN9O1xuIiwiaW1wb3J0IHtsb2d9IGZyb20gJ0xvZyc7XG5cbi8qKlxuICogQSBzY3JpcHQgaXMgYSBiZWhhdmlvdXIgdGhhdCBjYW4gYmUgYXR0YWNoZWQgdG8gYW4gZW50aXR5LiBUaGlzIGNsYXNzIHNob3VsZFxuICogYmUgZXh0ZW5kZWQuIFRoZSBtb3N0IGNvbW1vbiB1c2FnZSBmb3Igc2NyaXB0cyBpcyB0byBhZGQgc3BlY2lmaWMgYmVoYXZpb3Vyc1xuICogdG8gYSBzbWFsbCBzdWJzZXQgb2YgZW50aXRpZXMuXG4gKi9cbmNsYXNzIFNjcmlwdCB7XG4vKipcbiAqIEluaXRpYWxpemVkIHNjcmlwdC5cbiAqXG4gKiBAcGFyYW0gIHtPYmplY3R9IHBhcmFtZXRlcnMgQW55IHBhcmFtZXRlcnMgdGhhIGEgc2NyaXB0IG5lZWRzLiBBbGwgcGFyYW1ldGVyc1xuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyZSBjb3BpZWQgdG8gb2JqZWN0IHByb3BlcnRpZXMuXG4gKi9cbiAgY29uc3RydWN0b3IocGFyYW1ldGVycykge1xuICAgIC8vIENvcHkgcGFyYW1ldGVycyB0byB0aGlzIG9iamVjdFxuICAgIGxldCBhID0ge307XG4gICAgalF1ZXJ5LmV4dGVuZCh0cnVlLCBhLCBwYXJhbWV0ZXJzKTtcbiAgICBPYmplY3QuYXNzaWduKHRoaXMsIGEpO1xuXG4gICAgLy8gSW5pdGlhbGl6ZSBlbXB0eSBsaXN0IG9mIGV2ZW50IHR5cGVzXG4gICAgdGhpcy5ldmVudFR5cGVzID0gW107XG4gIH1cblxuLyoqXG4gKiBPbmNlIGFuIGVudGl0eSBoYXMgYmVlbiBjcmVhdGVkLCB0aGlzIGluaXQgaXMgcnVuLiBVc2VmdWwgZm9yIGNyZWF0aW5nIG1vcmVcbiAqIHBlcmZvcm1hbnQgc2NyaXB0czogaWYgYSBzY3JpcHQgbmVlZHMgdG8gcmVmZXJlbmNlIGFub3RoZXIgZW50aXR5LCB0aGlzXG4gKiBlbnRpdHkgY2FuIGJlIHNlYXJjaGVkIGFuZCBzdG9yZWQgZm9yIGFjY2VzcyBpbiB0aGUgdXBkYXRlIGZ1bmN0aW9uLlxuICpcbiAqIEBwYXJhbSAge0VudGl0eX0gcGFyZW50ICAgICBUaGUgb3duZXIgb2YgdGhlIHNjcmlwdC5cbiAqIEBwYXJhbSAge0VudGl0eX0gcm9vdEVudGl0eSBUaGUgdG9wbW9zdCBlbnRpdHkgZm9yIHdoaWNoIHRoZSBTY3JpcHRTeXN0ZW0gaXNcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICBydW4uXG4gKi9cbiAgaW5pdChwYXJlbnQsIHJvb3RFbnRpdHkpIHt9XG5cbi8qKlxuICogUnVuIG9uY2UgcGVyIGdhbWUgdXBkYXRlLlxuICpcbiAqIEBwYXJhbSAge0VudGl0eX0gcGFyZW50ICAgICBUaGUgb3duZXIgb2YgdGhlIHNjcmlwdC5cbiAqIEBwYXJhbSAge0VudGl0eX0gcm9vdEVudGl0eSBUaGUgdG9wbW9zdCBlbnRpdHkgZm9yIHdoaWNoIHRoZSBTY3JpcHRTeXN0ZW0gaXNcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICBydW4uXG4gKiBAcGFyYW0gIHtudW1iZXJ9IGRlbHRhICAgICAgVGltZSBzaW5jZSBsYXN0IHVwZGF0ZS5cbiAqL1xuICB1cGRhdGUocGFyZW50LCByb290RW50aXR5LCBkZWx0YSkge31cblxuLyoqXG4gKiBSdW4gYWZ0ZXIgdGhlIG1haW4gdXBkYXRlIGhhcyBiZWVuIHJ1biBmb3IgYWxsIGVudGl0aWVzLlxuICpcbiAqIEBwYXJhbSAge0VudGl0eX0gcGFyZW50ICAgICBUaGUgb3duZXIgb2YgdGhlIHNjcmlwdC5cbiAqIEBwYXJhbSAge0VudGl0eX0gcm9vdEVudGl0eSBUaGUgdG9wbW9zdCBlbnRpdHkgZm9yIHdoaWNoIHRoZSBTY3JpcHRTeXN0ZW0gaXNcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICBydW4uXG4gKiBAcGFyYW0gIHtudW1iZXJ9IGRlbHRhICAgICAgVGltZSBzaW5jZSBsYXN0IHVwZGF0ZS5cbiAqL1xuICBsYXRlVXBkYXRlKHBhcmVudCwgcm9vdEVudGl0eSwgZGVsdGEpIHt9XG5cbi8qKlxuICogSGFuZGxlcyBldmVudHMgcmVsZXZhbnQgdG8gdGhlIHNjcmlwdC5cbiAqIEBwYXJhbSAge1t0eXBlXX0gcGFyZW50IFRoZSBvd25lciBvZiB0aGUgc2NyaXB0LlxuICogQHBhcmFtICB7W3R5cGVdfSBldnQgICAgVGhlIGV2ZW50IHRvIGhhbmRsZS5cbiAqL1xuICBoYW5kbGVHYW1lRXZlbnQocGFyZW50LCBldnQpIHt9XG59XG5cbmV4cG9ydCB7U2NyaXB0fTtcbiIsImltcG9ydCB7bG9nfSBmcm9tICdMb2cnO1xuaW1wb3J0IHtTY3JpcHR9IGZyb20gJ1NjcmlwdCc7XG5pbXBvcnQge0lucHV0TWFuIGFzIElucHV0fSBmcm9tICdNYW5hZ2Vycy9JbnB1dE1hbmFnZXInO1xuaW1wb3J0IHtFdmVudE1hbn0gZnJvbSAnTWFuYWdlcnMvRXZlbnRNYW5hZ2VyJztcblxuY2xhc3MgQW5pbWF0aW9uU2NyaXB0IGV4dGVuZHMgU2NyaXB0IHtcbiAgY29uc3RydWN0b3IocGFyYW1ldGVycykge1xuICAgIHN1cGVyKHBhcmFtZXRlcnMpO1xuICAgIHRoaXMuZXZlbnRUeXBlcy5wdXNoKFxuICAgICAgJ2FuaW1hdGlvbl90ZXN0J1xuICAgICk7XG4gICAgdGhpcy50aW1lQXRDdXJyZW50RnJhbWUgPSAtMTtcbiAgICB0aGlzLmN1cnJlbnRGcmFtZSA9IDA7XG4gIH1cblxuICBpbml0KHJvb3RFbnRpdHkpIHtcbiAgICBsb2cuZGVidWcoJ2FuaW0gc2NyaXB0IGluaXQnKTtcbiAgfVxuXG4gIHVwZGF0ZShwYXJlbnQsIHJvb3RFbnRpdHksIGRlbHRhKSB7XG4gICAgY29uc3QgYW5pbSA9IHBhcmVudC5hbmltYXRpb247XG5cbiAgICBpZihhbmltKXtcbiAgICAgIGNvbnN0IGZyYW1lcyA9IGFuaW0uYW5pbTtcblxuICAgICAgaWYodGhpcy50aW1lQXRDdXJyZW50RnJhbWUgPiBmcmFtZXNbdGhpcy5jdXJyZW50RnJhbWVdLmR1cmF0aW9uIHx8IHRoaXMudGltZUF0Q3VycmVudEZyYW1lID09PSAtMSl7XG4gICAgICAgIC8vIENoYW5nZSBjdXJyZW50IGZyYW1lXG4gICAgICAgIGNvbnN0IG5ld0ZyYW1lID0gKHRoaXMuY3VycmVudEZyYW1lICsgMSkgJSBmcmFtZXMubGVuZ3RoO1xuICAgICAgICB0aGlzLmN1cnJlbnRGcmFtZSA9IG5ld0ZyYW1lO1xuICAgICAgICBwYXJlbnQuc2V0U3ByaXRlKGZyYW1lc1t0aGlzLmN1cnJlbnRGcmFtZV0uZnJhbWUpO1xuICAgICAgICB0aGlzLnRpbWVBdEN1cnJlbnRGcmFtZSA9IDA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnRpbWVBdEN1cnJlbnRGcmFtZSArPSBkZWx0YTtcbiAgICAgIH1cbiAgICB9IGVsc2V7XG4gICAgICBsb2cud2FybignQW5pbWF0aW9uIHNjcmlwdCBuZWVkcyBhbmltYXRpb24gY29tcG9uZW50IHRvIHdvcmsnKTtcbiAgICB9XG4gIH1cblxuICBoYW5kbGVHYW1lRXZlbnQocGFyZW50LCBldnQpIHtcbiAgICBsb2cuZGVidWcoJ0FuaW0gc2NyaXB0OiAnICsgZXZ0LnBhcmFtZXRlcnMubWVzc2FnZSk7XG4gIH1cbn1cblxuZXhwb3J0IHtBbmltYXRpb25TY3JpcHR9O1xuIiwiaW1wb3J0IHtsb2d9IGZyb20gJ0xvZyc7XG5pbXBvcnQge1NjcmlwdH0gZnJvbSAnU2NyaXB0JztcbmltcG9ydCB7SW5wdXRNYW4gYXMgSW5wdXR9IGZyb20gJ01hbmFnZXJzL0lucHV0TWFuYWdlcic7XG5pbXBvcnQge0V2ZW50TWFufSBmcm9tICdNYW5hZ2Vycy9FdmVudE1hbmFnZXInO1xuaW1wb3J0IHtyZXNvdXJjZXN9IGZyb20gJ01hbmFnZXJzL1Jlc291cmNlTWFuYWdlcic7XG5pbXBvcnQge0VudGl0eX0gZnJvbSAnRW50aXR5JztcbmltcG9ydCBjZmcgZnJvbSAnY29uZmlnLmpzb24nO1xuXG5jbGFzcyBGb3JjZUlucHV0U2NyaXB0IGV4dGVuZHMgU2NyaXB0IHtcbiAgY29uc3RydWN0b3IocGFyYW1ldGVycykge1xuICAgIHN1cGVyKHBhcmFtZXRlcnMpO1xuICAgIHRoaXMudGVhbSA9IHBhcmFtZXRlcnMudGVhbTtcbiAgICB0aGlzLmV2ZW50VHlwZXMucHVzaChcbiAgICAgICdpbnB1dF90ZXN0JyxcbiAgICAgICd0dXJuJyxcbiAgICAgICdwbGF5X3R1cm4nXG4gICAgKTtcbiAgICB0aGlzLnRlYW0gPSBwYXJhbWV0ZXJzLnRlYW07XG4gICAgdGhpcy5pbnB1dHRpbmcgPSBmYWxzZTtcbiAgICB0aGlzLm15VHVybiA9IGZhbHNlO1xuICB9XG5cbiAgaW5pdChwYXJlbnQsIHJvb3RFbnRpdHkpIHtcbiAgICB0aGlzLmFycm93U3ByaXRlID0gbmV3IFBJWEkuU3ByaXRlKCk7XG4gICAgdGhpcy5hcnJvd1Nwcml0ZS5waXZvdCA9IHt4OiA1MTIsIHk6IDEyOH07XG4gICAgdGhpcy5hcnJvd1Nwcml0ZS5hbmNob3IgPSB7XG4gICAgICB4OiAwLFxuICAgICAgeTogMFxuICAgIH07XG4gICAgdGhpcy5hcnJvd1Nwcml0ZS50ZXh0dXJlID0gcmVzb3VyY2VzLnNwcml0ZS50ZXh0dXJlc1snYXJyb3cnXTtcbiAgICBwYXJlbnQuYWRkQ2hpbGQodGhpcy5hcnJvd1Nwcml0ZSk7XG4gICAgdGhpcy5hcnJvd1Nwcml0ZS5zY2FsZSA9IHt4OiAwLjAsIHk6IDAuMX07XG4gICAgLy8gdGhpcy5hcnJvd0VudGl0eSA9IEVudGl0eS5mcm9tQ29uZmlnKCdlbnRpdHlfZm9yY2VfYXJyb3cnKTtcbiAgICAvLyBsb2cuZGVidWcodGhpcy5hcnJvd0VudGl0eSk7XG4gICAgLy8gcGFyZW50LmNoaWxkcmVuLnB1c2godGhpcy5hcnJvd0VudGl0eSk7XG4gICAgLy8gcGFyZW50LnNldFNwcml0ZSgnZGVidWdfMicpO1xuICB9XG5cbiAgdGVzdENvbGxpc2lvbihwYXJlbnQsIHBvaW50KSB7XG4gICAgaWYgKHBhcmVudC5waHlzaWNzKSB7XG4gICAgICBsZXQgYm9kID0gcGFyZW50LnBoeXNpY3MuYm9keTtcbiAgICAgIGxldCBmaXh0dXJlcyA9IGJvZC5HZXRGaXh0dXJlTGlzdCgpO1xuICAgICAgbGV0IGZpeCA9IHBhcmVudC5waHlzaWNzLmZpeHR1cmU7XG4gICAgICBsZXQgcCA9IG5ldyBiMlZlYzIocG9pbnQueC9jZmcucGh5c2ljc1NjYWxlLCBwb2ludC55L2NmZy5waHlzaWNzU2NhbGUpO1xuICAgICAgbGV0IHBvcyA9IGJvZC5HZXRQb3NpdGlvbigpO1xuICAgICAgbGV0IHQgPSBmaXh0dXJlcy5UZXN0UG9pbnQocCk7XG4gICAgICByZXR1cm4gdDtcbiAgICAgIC8vICByZXR1cm4gKGZpeC5UZXN0UG9pbnQocCkpO1xuICAgICAgLy8gcmV0dXJuIE1hdHRlci5Cb3VuZHMuY29udGFpbnMoYm9kLmJvdW5kcywgcG9pbnQpICYmIE1hdHRlci5WZXJ0aWNlcy5jb250YWlucyhib2QudmVydGljZXMsIHBvaW50KTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gVE9ET1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIGxlbmd0aCh4LCB5KSB7XG4gICAgcmV0dXJuIE1hdGguc3FydCh4KnggKyB5KnkpO1xuICB9XG5cbiAgdXBkYXRlKHBhcmVudCwgcm9vdEVudGl0eSwgZGVsdGEpIHtcbiAgICBpZiAodGhpcy5teVR1cm4pIHtcbiAgICAgIGxldCBwb3MgPSBJbnB1dC5tb3VzZVBvcztcbiAgICAgIGlmIChwYXJlbnQucGh5c2ljcykge1xuICAgICAgICBsZXQgYm9kID0gcGFyZW50LnBoeXNpY3MuYm9keTtcbiAgICAgICAgaWYgKElucHV0Lm1vdXNlUHJlc3NlZCAmJiB0aGlzLnRlc3RDb2xsaXNpb24ocGFyZW50LCBwb3MpKSB7XG4gICAgICAgICAgdGhpcy5pbnB1dHRpbmcgPSB0cnVlO1xuICAgICAgICB9IGVsc2UgaWYgKElucHV0Lm1vdXNlUmVsZWFzZWQgJiYgdGhpcy5pbnB1dHRpbmcpIHtcbiAgICAgICAgICBsZXQgYm9kUG9zID0gYm9kLkdldFBvc2l0aW9uKCk7XG4gICAgICAgICAgbGV0IGJQb3MgPSB7XG4gICAgICAgICAgICB4OiBib2RQb3MuZ2V0X3goKSAqIGNmZy5waHlzaWNzU2NhbGUsXG4gICAgICAgICAgICB5OiBib2RQb3MuZ2V0X3koKSAqIGNmZy5waHlzaWNzU2NhbGVcbiAgICAgICAgICB9O1xuICAgICAgICAgIHRoaXMuaW5wdXR0aW5nID0gZmFsc2U7XG4gICAgICAgICAgbGV0IGRpZlggPSBiUG9zLnggLSBwb3MueDtcbiAgICAgICAgICBsZXQgZGlmWSA9IGJQb3MueSAtIHBvcy55O1xuXG4gICAgICAgICAgbGV0IGwgPSB0aGlzLmxlbmd0aChkaWZYLCBkaWZZKTtcbiAgICAgICAgICBkaWZYIC89IGw7XG4gICAgICAgICAgZGlmWSAvPSBsO1xuXG4gICAgICAgICAgbCA9IE1hdGgubWluKGNmZy5tYXhGb3JjZSwgbCk7XG5cbiAgICAgICAgICBkaWZYICo9IGw7XG4gICAgICAgICAgZGlmWSAqPSBsO1xuXG4gICAgICAgICAgYm9kLkFwcGx5TGluZWFySW1wdWxzZShuZXcgYjJWZWMyKGRpZlgsIGRpZlkpLCBib2QuR2V0V29ybGRDZW50ZXIoKSwgdHJ1ZSk7XG4gICAgICAgICAgdGhpcy5teVR1cm4gPSBmYWxzZTtcbiAgICAgICAgICBwYXJlbnQuYWxwaGEgPSAwLjU7XG4gICAgICAgICAgdGhpcy5hcnJvd1Nwcml0ZS5wb3NpdGlvbi54ICs9IGRpZlg7XG4gICAgICAgICAgdGhpcy5hcnJvd1Nwcml0ZS5wb3NpdGlvbi55ICs9IGRpZlk7XG4gICAgICAgICAgRXZlbnRNYW4ucHVibGlzaCh7XG4gICAgICAgICAgICBldmVudFR5cGU6IHRoaXMudGVhbSArICdfbW92ZScsXG4gICAgICAgICAgICBwYXJhbWV0ZXJzOiB7fVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIC8vIE1hdHRlci5Cb2R5LmFwcGx5Rm9yY2UoYm9kLCBib2RQb3MsIHt4OiBkaWZYIC8gNTAwLjAsIHk6IGRpZlkgLyA1MDAuMH0pO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuaW5wdXR0aW5nKSB7XG4gICAgICAgICAgdGhpcy5hcnJvd1Nwcml0ZS5wb3NpdGlvbiA9IHtcbiAgICAgICAgICAgIHg6IDAsXG4gICAgICAgICAgICB5OiAwXG4gICAgICAgICAgfVxuICAgICAgICAgIGxldCBib2RQb3MgPSBib2QuR2V0UG9zaXRpb24oKTtcbiAgICAgICAgICBsZXQgYlBvcyA9IHtcbiAgICAgICAgICAgIHg6IGJvZFBvcy5nZXRfeCgpICogY2ZnLnBoeXNpY3NTY2FsZSxcbiAgICAgICAgICAgIHk6IGJvZFBvcy5nZXRfeSgpICogY2ZnLnBoeXNpY3NTY2FsZVxuICAgICAgICAgIH07XG4gICAgICAgICAgdGhpcy5hcnJvd1Nwcml0ZS5hbHBoYSA9IDAuODtcbiAgICAgICAgICBsZXQgZGlmWCA9IGJQb3MueCAtIHBvcy54O1xuICAgICAgICAgIGxldCBkaWZZID0gYlBvcy55IC0gcG9zLnk7XG5cbiAgICAgICAgICBsZXQgbCA9IHRoaXMubGVuZ3RoKGRpZlgsIGRpZlkpO1xuICAgICAgICAgIGRpZlggLz0gbDtcbiAgICAgICAgICBkaWZZIC89IGw7XG5cbiAgICAgICAgICBsID0gTWF0aC5taW4oY2ZnLm1heEZvcmNlLCBsKTtcblxuICAgICAgICAgIGRpZlggKj0gbDtcbiAgICAgICAgICBkaWZZICo9IGw7XG5cbiAgICAgICAgICAvLyBjb25zb2xlLmxvZyhsKTtcblxuICAgICAgICAgIGNvbnN0IGFuZyA9IE1hdGguYXRhbjIoZGlmWSAvIGwsIGRpZlggLyBsKTtcblxuICAgICAgICAgIHRoaXMuYXJyb3dTcHJpdGUucm90YXRpb24gPSBhbmcgLSBwYXJlbnQucm90YXRpb247XG4gICAgICAgICAgdGhpcy5hcnJvd1Nwcml0ZS5zY2FsZS54ID0gbC81MTIuMDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLmFycm93U3ByaXRlLmFscGhhID0gMC4wO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgaGFuZGxlR2FtZUV2ZW50KHBhcmVudCwgZXZ0KSB7XG4gICAgaWYgKGV2dC5ldmVudFR5cGUuc3RhcnRzV2l0aCgndHVybl8nKSkge1xuICAgICAgaWYgKGV2dC5ldmVudFR5cGUgPT09ICgndHVybl8nICsgdGhpcy50ZWFtKSkge1xuICAgICAgICBwYXJlbnQuYWxwaGEgPSAxLjA7XG4gICAgICAgIHRoaXMubXlUdXJuID0gdHJ1ZTtcbiAgICAgICAgcGFyZW50LnJvdGF0aW9uID0gMDtcbiAgICAgICAgY29uc3QgYm9kID0gcGFyZW50LnBoeXNpY3MuYm9keTtcbiAgICAgICAgYm9kLlNldExpbmVhclZlbG9jaXR5KG5ldyBiMlZlYzIoMCwgMCkpO1xuICAgICAgICBib2QuU2V0QW5ndWxhclZlbG9jaXR5KDApO1xuICAgICAgICBib2QuU2V0VHJhbnNmb3JtKGJvZC5HZXRXb3JsZENlbnRlcigpLCAwKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBhcmVudC5hbHBoYSA9IDAuNTtcbiAgICAgICAgdGhpcy5hcnJvd1Nwcml0ZS5hbHBoYSA9IDAuMDtcbiAgICAgICAgdGhpcy5teVR1cm4gPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGV2dC5ldmVudFR5cGUgPT09ICdwbGF5X3R1cm4nKSB7XG4gICAgICBwYXJlbnQuYWxwaGEgPSAxLjA7XG4gICAgICB0aGlzLmFycm93U3ByaXRlLmFscGhhID0gMC4wO1xuICAgIH1cbiAgICBsb2cuZGVidWcoZXZ0LnBhcmFtZXRlcnMubWVzc2FnZSk7XG4gIH1cbn1cblxuZXhwb3J0IHtGb3JjZUlucHV0U2NyaXB0fTtcbiIsImltcG9ydCB7bG9nfSBmcm9tICdMb2cnO1xuaW1wb3J0IHtTY3JpcHR9IGZyb20gJ1NjcmlwdCc7XG5pbXBvcnQge0V2ZW50TWFufSBmcm9tICdNYW5hZ2Vycy9FdmVudE1hbmFnZXInO1xuXG5jbGFzcyBHb2FsU2NyaXB0IGV4dGVuZHMgU2NyaXB0IHtcbiAgY29uc3RydWN0b3IocGFyYW1ldGVycykge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy50ZWFtID0gcGFyYW1ldGVycy50ZWFtO1xuICAgIHRoaXMuY2FuU2NvcmUgPSBmYWxzZTtcbiAgICB0aGlzLmV2ZW50VHlwZXMucHVzaChcbiAgICAgICduZXdfZ2FtZScsXG4gICAgICAnZ29hbCdcbiAgICApO1xuICB9XG5cbiAgc2VhcmNoRW50aXRpZXMocm9vdEVudGl0eSwgY29uZGl0aW9uKSB7XG4gICAgaWYgKGNvbmRpdGlvbihyb290RW50aXR5KSkge1xuICAgICAgcmV0dXJuIHJvb3RFbnRpdHk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcm9vdEVudGl0eS5jaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICBsZXQgY2hpbGQgPSByb290RW50aXR5LmNoaWxkcmVuW2ldO1xuICAgICAgICBsZXQgcyA9IHRoaXMuc2VhcmNoRW50aXRpZXMoY2hpbGQsIGNvbmRpdGlvbik7XG4gICAgICAgIGlmIChzKSByZXR1cm4gcztcbiAgICAgIH1cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuXG4gIGluaXQocGFyZW50LCByb290RW50aXR5KSB7XG4gICAgdGhpcy5wdWNrID0gdGhpcy5zZWFyY2hFbnRpdGllcyhyb290RW50aXR5LCAoZW50aXR5KSA9PiB7XG4gICAgICBpZiAoZW50aXR5LnRhZ3MpIHtcbiAgICAgICAgcmV0dXJuIGVudGl0eS50YWdzLmluZGV4T2YoJ3B1Y2snKSA+PSAwO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgdXBkYXRlKHBhcmVudCwgcm9vdEVudGl0eSwgZGVsdGEpIHtcbiAgICBpZiAodGhpcy5jYW5TY29yZSkge1xuICAgICAgbGV0IGZpeCA9IHBhcmVudC5waHlzaWNzLmZpeHR1cmU7XG4gICAgICBpZiAodGhpcy5wdWNrLnBoeXNpY3MuYm9keSkge1xuICAgICAgICBsZXQgcG9zID0gdGhpcy5wdWNrLnBoeXNpY3MuYm9keS5HZXRXb3JsZENlbnRlcigpO1xuICAgICAgICBpZiAoZml4LlRlc3RQb2ludChwb3MpKSB7XG4gICAgICAgICAgRXZlbnRNYW4ucHVibGlzaCh7XG4gICAgICAgICAgICBldmVudFR5cGU6IFwiZ29hbF9cIiArIHRoaXMudGVhbSxcbiAgICAgICAgICAgIHBhcmFtZXRlcnM6IHt9XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgRXZlbnRNYW4ucHVibGlzaCh7XG4gICAgICAgICAgICBldmVudFR5cGU6IFwicGh5c2ljc19zcGVlZFwiLFxuICAgICAgICAgICAgcGFyYW1ldGVyczoge3NwZWVkOiAwLjF9XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgdGhpcy5jYW5TY29yZSA9IGZhbHNlO1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwiZ29hbF9cIiArIHRoaXMudGVhbSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGhhbmRsZUdhbWVFdmVudChwYXJlbnQsIGV2dCkge1xuICAgIGlmIChldnQuZXZlbnRUeXBlID09PSAnbmV3X2dhbWUnKSB7XG4gICAgICB0aGlzLmNhblNjb3JlID0gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKGV2dC5ldmVudFR5cGUuaW5jbHVkZXMoJ2dvYWwnKSkge1xuICAgICAgdGhpcy5jYW5TY29yZSA9IGZhbHNlO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQge0dvYWxTY3JpcHR9O1xuIiwiaW1wb3J0IHtsb2d9IGZyb20gJ0xvZyc7XG5pbXBvcnQge1NjcmlwdH0gZnJvbSAnU2NyaXB0JztcbmltcG9ydCB7RXZlbnRNYW59IGZyb20gJ01hbmFnZXJzL0V2ZW50TWFuYWdlcic7XG5pbXBvcnQgY2ZnIGZyb20gJ2NvbmZpZy5qc29uJztcblxuLyoqXG4gKiBUaGlzIGlzIGEgc2tlbGV0b24gZm9yIHdyaXRpbmcgc2NyaXB0cy4gUmVtZW1iZXIgdG8gYWRkIHRoZSBjcmVhdGVkIHNjcmlwdCB0b1xuICogU2NyaXB0cy9TY3JpcHRzLmpzLlxuICovXG5cbmNsYXNzIEluaXRpYWxpemVXb3JsZCBleHRlbmRzIFNjcmlwdCB7XG4gIGNvbnN0cnVjdG9yKHBhcmFtZXRlcnMpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMucmVzZXRUaW1lciA9IHtcbiAgICAgIHRpbWU6IDAuMCxcbiAgICAgIHJ1bm5pbmc6IGZhbHNlLFxuICAgICAgbGltaXQ6IGNmZy52aWN0b3J5VGltZVxuICAgIH07XG4gICAgdGhpcy5yZWRNb3ZlcyA9IDA7XG4gICAgdGhpcy5ibHVlTW92ZXMgPSAwO1xuICAgIHRoaXMuZXZlbnRUeXBlcy5wdXNoKFxuICAgICAgJ2dvYWwnLFxuICAgICAgJ25ld19nYW1lJyxcbiAgICAgICdyZWQnLFxuICAgICAgJ2JsdWUnLFxuICAgICAgJ3BoeXNpY3Nfc2xlZXBpbmcnLFxuICAgICAgJ3BsYXlfdHVybidcbiAgICApO1xuICAgIHRoaXMucGxheWluZyA9IGZhbHNlO1xuICB9XG5cbiAgaW5pdChwYXJlbnQsIHJvb3RFbnRpdHkpIHtcbiAgICAvLyBXaGVuIGFuIGVudGl0eSBpcyBjcmVhdGVkLCB0aGlzIGlzIHJ1blxuICAgIEV2ZW50TWFuLnB1Ymxpc2goe1xuICAgICAgZXZlbnRUeXBlOiBcIm5ld19nYW1lXCIsXG4gICAgICBwYXJhbWV0ZXJzOiB7fVxuICAgIH0pO1xuICB9XG5cbiAgdXBkYXRlKHBhcmVudCwgcm9vdEVudGl0eSwgZGVsdGEpIHtcbiAgICBpZiAodGhpcy5yZXNldFRpbWVyLnJ1bm5pbmcpIHtcbiAgICAgIHRoaXMucmVzZXRUaW1lci50aW1lICs9IGRlbHRhO1xuICAgICAgaWYgKHRoaXMucmVzZXRUaW1lci50aW1lID4gdGhpcy5yZXNldFRpbWVyLmxpbWl0KSB7XG4gICAgICAgIGxvZy5kZWJ1ZyhcIlJFU0VUXCIpO1xuICAgICAgICB0aGlzLnJlc2V0VGltZXIudGltZSA9IDAuMDtcbiAgICAgICAgdGhpcy5yZXNldFRpbWVyLnJ1bm5pbmcgPSBmYWxzZTtcbiAgICAgICAgRXZlbnRNYW4ucHVibGlzaCh7XG4gICAgICAgICAgZXZlbnRUeXBlOiBcIm5ld19nYW1lXCIsXG4gICAgICAgICAgcGFyYW1ldGVyczoge31cbiAgICAgICAgfSk7XG4gICAgICAgIEV2ZW50TWFuLnB1Ymxpc2goe1xuICAgICAgICAgIGV2ZW50VHlwZTogXCJwaHlzaWNzX3NwZWVkXCIsXG4gICAgICAgICAgcGFyYW1ldGVyczoge3NwZWVkOiAxLjB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJlc2V0VHVybnMoKSB7XG4gICAgbG9nLmRlYnVnKFwiUmVzZXQgdHVybnMsIHJlZCB0dXJuXCIpO1xuICAgIHRoaXMucGxheWluZyA9IGZhbHNlO1xuICAgIEV2ZW50TWFuLnB1Ymxpc2goe1xuICAgICAgZXZlbnRUeXBlOiAndHVybl9yZWQnLFxuICAgICAgcGFyYW1ldGVyczoge31cbiAgICB9KTtcbiAgICBFdmVudE1hbi5wdWJsaXNoKHtcbiAgICAgIGV2ZW50VHlwZTogJ3BoeXNpY3NfcGF1c2UnLFxuICAgICAgcGFyYW1ldGVyczoge31cbiAgICB9KTtcbiAgICB0aGlzLnJlZE1vdmVzID0gMDtcbiAgICB0aGlzLmJsdWVNb3ZlcyA9IDA7XG4gIH1cblxuICBoYW5kbGVHYW1lRXZlbnQocGFyZW50LCBldnQpIHtcbiAgICBpZiAoZXZ0LmV2ZW50VHlwZSA9PT0gJ25ld19nYW1lJykge1xuICAgICAgdGhpcy5yZXNldFR1cm5zKCk7XG4gICAgfSBlbHNlIGlmIChldnQuZXZlbnRUeXBlID09PSAncGxheV90dXJuJykge1xuICAgICAgdGhpcy5wbGF5aW5nID0gdHJ1ZTtcbiAgICB9IGVsc2UgaWYgKGV2dC5ldmVudFR5cGUgPT09ICdnb2FsX3JlZCcpIHtcbiAgICAgIGxvZy5kZWJ1ZyhcIlJFRCBTQ09SRVNcIik7XG4gICAgICB0aGlzLnJlc2V0VGltZXIucnVubmluZyA9IHRydWU7XG4gICAgfSBlbHNlIGlmIChldnQuZXZlbnRUeXBlID09PSAnZ29hbF9ibHVlJykge1xuICAgICAgbG9nLmRlYnVnKFwiQkxVRSBTQ09SRVNcIik7XG4gICAgICB0aGlzLnJlc2V0VGltZXIucnVubmluZyA9IHRydWU7XG4gICAgfSBlbHNlIGlmIChldnQuZXZlbnRUeXBlID09PSAncmVkX21vdmUnKSB7XG4gICAgICB0aGlzLnJlZE1vdmVzICs9IDE7XG4gICAgICBsb2cuZGVidWcoXCJSZWQgTW92ZXM6IFwiICsgdGhpcy5yZWRNb3Zlcyk7XG4gICAgICBpZiAodGhpcy5yZWRNb3ZlcyA9PT0gMykgeyAvLyBDb3VudCBwbGF5ZXJzIGF0IGluaXRcbiAgICAgICAgRXZlbnRNYW4ucHVibGlzaCh7XG4gICAgICAgICAgZXZlbnRUeXBlOiAndHVybl9ibHVlJyxcbiAgICAgICAgICBwYXJhbWV0ZXJzOiB7fVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGV2dC5ldmVudFR5cGUgPT09ICdibHVlX21vdmUnKSB7XG4gICAgICB0aGlzLmJsdWVNb3ZlcyArPSAxO1xuICAgICAgbG9nLmRlYnVnKFwiQmx1ZSBNb3ZlczogXCIgKyB0aGlzLmJsdWVNb3Zlcyk7XG4gICAgICBpZiAodGhpcy5ibHVlTW92ZXMgPT09IDMpIHtcbiAgICAgICAgRXZlbnRNYW4ucHVibGlzaCh7XG4gICAgICAgICAgZXZlbnRUeXBlOiAncGxheV90dXJuJyxcbiAgICAgICAgICBwYXJhbWV0ZXJzOiB7fVxuICAgICAgICB9KTtcbiAgICAgICAgRXZlbnRNYW4ucHVibGlzaCh7XG4gICAgICAgICAgZXZlbnRUeXBlOiAncGh5c2ljc19wbGF5JyxcbiAgICAgICAgICBwYXJhbWV0ZXJzOiB7fVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGV2dC5ldmVudFR5cGUgPT09ICdwaHlzaWNzX3NsZWVwaW5nJykge1xuICAgICAgaWYgKHRoaXMucGxheWluZykge1xuICAgICAgICBsb2cuZGVidWcoXCJQaHlzaWNzIHNsZWVwaW5nLCByZWQgdHVyblwiKTtcbiAgICAgICAgdGhpcy5yZXNldFR1cm5zKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCB7SW5pdGlhbGl6ZVdvcmxkfTtcbiIsImltcG9ydCB7bG9nfSBmcm9tICdMb2cnO1xuaW1wb3J0IHtTY3JpcHR9IGZyb20gJ1NjcmlwdCc7XG5pbXBvcnQge0lucHV0TWFuIGFzIElucHV0fSBmcm9tICdNYW5hZ2Vycy9JbnB1dE1hbmFnZXInO1xuaW1wb3J0IHtFdmVudE1hbn0gZnJvbSAnTWFuYWdlcnMvRXZlbnRNYW5hZ2VyJztcblxuY2xhc3MgSW5wdXRTY3JpcHQgZXh0ZW5kcyBTY3JpcHQge1xuICBjb25zdHJ1Y3RvcihwYXJhbWV0ZXJzKSB7XG4gICAgc3VwZXIocGFyYW1ldGVycyk7XG4gICAgdGhpcy5ldmVudFR5cGVzLnB1c2goXG4gICAgICAnaW5wdXRfdGVzdCdcbiAgICApO1xuICB9XG4gIHVwZGF0ZShwYXJlbnQsIHJvb3RFbnRpdHksIGRlbHRhKSB7XG4gICAgaWYgKElucHV0LmtleURvd24udXApIHtcbiAgICAgIHBhcmVudC5wb3NpdGlvbi55IC09IDE7XG4gICAgfVxuICAgIGlmIChJbnB1dC5rZXlEb3duLmRvd24pIHtcbiAgICAgIHBhcmVudC5wb3NpdGlvbi55ICs9IDE7XG4gICAgfVxuICAgIGlmIChJbnB1dC5rZXlEb3duLmxlZnQpIHtcbiAgICAgIHBhcmVudC5wb3NpdGlvbi54IC09IDE7XG4gICAgfVxuICAgIGlmIChJbnB1dC5rZXlEb3duLnJpZ2h0KSB7XG4gICAgICBwYXJlbnQucG9zaXRpb24ueCArPSAxO1xuICAgIH1cbiAgICBpZihJbnB1dC5rZXlQcmVzc2VkLnJpZ2h0KSB7XG4gICAgICBFdmVudE1hbi5wdWJsaXNoKHsgZXZlbnRUeXBlOiAnYXVkaW8nLCBwYXJhbWV0ZXJzOiB7IGF1ZGlvOidhdWRpb19oaXRfbm9pc2UnfX0pO1xuICAgIH1cbiAgfVxuXG4gIGhhbmRsZUdhbWVFdmVudChwYXJlbnQsIGV2dCkge1xuICAgIGxvZy5kZWJ1ZyhldnQucGFyYW1ldGVycy5tZXNzYWdlKTtcbiAgfVxufVxuXG5leHBvcnQge0lucHV0U2NyaXB0fTtcbiIsImltcG9ydCB7bG9nfSBmcm9tICdMb2cnO1xuaW1wb3J0IHtTY3JpcHR9IGZyb20gJ1NjcmlwdCc7XG5pbXBvcnQge0V2ZW50TWFufSBmcm9tICdNYW5hZ2Vycy9FdmVudE1hbmFnZXInO1xuXG4vKipcbiAqIFRoaXMgaXMgYSBza2VsZXRvbiBmb3Igd3JpdGluZyBzY3JpcHRzLiBSZW1lbWJlciB0byBhZGQgdGhlIGNyZWF0ZWQgc2NyaXB0IHRvXG4gKiBTY3JpcHRzL1NjcmlwdHMuanMuXG4gKi9cblxuY2xhc3MgUG9pbnRTY3JpcHQgZXh0ZW5kcyBTY3JpcHQge1xuICBjb25zdHJ1Y3RvcihwYXJhbWV0ZXJzKSB7XG4gICAgc3VwZXIoKTtcbiAgICAvLyBBZGQgZXZlbnQgdHlwZXMgdG8gbGlzdGVuIHRvXG4gICAgdGhpcy50ZWFtID0gcGFyYW1ldGVycy50ZWFtO1xuICAgIHRoaXMuZXZlbnRUeXBlcy5wdXNoKFxuICAgICAgKCdnb2FsXycgKyB0aGlzLnRlYW0pXG4gICAgKTtcbiAgICB0aGlzLnRleHRTdHlsZSA9IHtcbiAgICAgIGZvbnQ6ICc3MnB4IEFyaWFsJyxcbiAgICAgIGZpbGwgOiAweDY2NjY2NixcbiAgICAgIGFsaWduIDogJ2NlbnRlcidcbiAgICB9O1xuICAgIHRoaXMuc2NvcmUgPSAwO1xuICB9XG5cbiAgLy8gV2hlbiBhbiBlbnRpdHkgaXMgY3JlYXRlZCwgdGhpcyBpcyBydW5cbiAgaW5pdChwYXJlbnQsIHJvb3RFbnRpdHkpIHtcbiAgICBsb2cuZGVidWcoXCJQT0lOVFNcIik7XG4gICAgbG9nLmRlYnVnKHBhcmVudC5wb3NpdGlvbik7XG4gICAgdGhpcy50ZXh0ID0gbmV3IFBJWEkuVGV4dCh0aGlzLnNjb3JlLCB0aGlzLnRleHRTdHlsZSk7XG4gICAgcGFyZW50LmFkZENoaWxkKHRoaXMudGV4dCk7XG4gIH1cblxuICAvLyBSdW5zIGVhY2ggdXBkYXRlIGZyYW1lXG4gIHVwZGF0ZShwYXJlbnQsIHJvb3RFbnRpdHksIGRlbHRhKSB7XG4gICAgLy8gbG9nLmRlYnVnKHBhcmVudC5wb3NpdGlvbik7XG4gIH1cblxuICAvLyBIYW5kbGVzIGV2ZW50cy4gVG8gY2F0Y2ggZXZlbnRzLCBldmVudFR5cGVzIG11c3QgYmUgZGVjbGFyZWRcbiAgaGFuZGxlR2FtZUV2ZW50KHBhcmVudCwgZXZ0KSB7XG4gICAgaWYgKGV2dC5ldmVudFR5cGUgPT09ICgnZ29hbF8nICsgdGhpcy50ZWFtKSkge1xuICAgICAgbG9nLmRlYnVnKFwiR29hbCBmb3IgXCIgKyB0aGlzLnRlYW0pO1xuICAgICAgdGhpcy5zY29yZSArPSAxO1xuICAgICAgdGhpcy50ZXh0LnRleHQgPSB0aGlzLnNjb3JlO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQge1BvaW50U2NyaXB0fTtcbiIsImltcG9ydCB7bG9nfSBmcm9tICdMb2cnO1xuaW1wb3J0IHtTY3JpcHR9IGZyb20gJ1NjcmlwdCc7XG5pbXBvcnQge0V2ZW50TWFufSBmcm9tICdNYW5hZ2Vycy9FdmVudE1hbmFnZXInO1xuXG4vKipcbiAqIFRoaXMgaXMgYSBza2VsZXRvbiBmb3Igd3JpdGluZyBzY3JpcHRzLiBSZW1lbWJlciB0byBhZGQgdGhlIGNyZWF0ZWQgc2NyaXB0IHRvXG4gKiBTY3JpcHRzL1NjcmlwdHMuanMuXG4gKi9cblxuY2xhc3MgUmVzZXRQb3NpdGlvblNjcmlwdCBleHRlbmRzIFNjcmlwdCB7XG4gIGNvbnN0cnVjdG9yKHBhcmFtZXRlcnMpIHtcbiAgICBzdXBlcigpO1xuICAgIC8vIEFkZCBldmVudCB0eXBlcyB0byBsaXN0ZW4gdG9cbiAgICB0aGlzLmV2ZW50VHlwZXMucHVzaChcbiAgICAgICduZXdfZ2FtZSdcbiAgICApO1xuICB9XG5cbiAgLy8gV2hlbiBhbiBlbnRpdHkgaXMgY3JlYXRlZCwgdGhpcyBpcyBydW5cbiAgaW5pdChwYXJlbnQsIHJvb3RFbnRpdHkpIHtcbiAgICBsb2cuZGVidWcoXCJJbml0aW5nIHJlc2V0IHNjcmlwdFwiKTtcbiAgfVxuXG5cbiAgLy8gUnVucyBlYWNoIHVwZGF0ZSBmcmFtZVxuICB1cGRhdGUocGFyZW50LCByb290RW50aXR5LCBkZWx0YSkge1xuICAgIGlmICghKHRoaXMub3JpZ2luYWxQb3NpdGlvbikpIHtcbiAgICAgIGlmIChwYXJlbnQucGh5c2ljcy5ib2R5KSB7XG4gICAgICAgIGxldCBwb3MgPSBwYXJlbnQucGh5c2ljcy5ib2R5LkdldFdvcmxkQ2VudGVyKCk7XG4gICAgICAgIHRoaXMub3JpZ2luYWxQb3NpdGlvbiA9IHtcbiAgICAgICAgICB4OiBwb3MuZ2V0X3goKSxcbiAgICAgICAgICB5OiBwb3MuZ2V0X3koKVxuICAgICAgICB9O1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIEhhbmRsZXMgZXZlbnRzLiBUbyBjYXRjaCBldmVudHMsIGV2ZW50VHlwZXMgbXVzdCBiZSBkZWNsYXJlZFxuICBoYW5kbGVHYW1lRXZlbnQocGFyZW50LCBldnQpIHtcbiAgICBpZiAoZXZ0LmV2ZW50VHlwZSA9PT0gJ25ld19nYW1lJykge1xuICAgICAgcGFyZW50LnBoeXNpY3MuYm9keS5TZXRUcmFuc2Zvcm0obmV3IGIyVmVjMih0aGlzLm9yaWdpbmFsUG9zaXRpb24ueCwgdGhpcy5vcmlnaW5hbFBvc2l0aW9uLnkpLCAwLjApO1xuICAgICAgcGFyZW50LnBoeXNpY3MuYm9keS5TZXRMaW5lYXJWZWxvY2l0eShuZXcgYjJWZWMyKDAsIDApKTtcbiAgICAgIHBhcmVudC5waHlzaWNzLmJvZHkuU2V0QW5ndWxhclZlbG9jaXR5KDApO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQge1Jlc2V0UG9zaXRpb25TY3JpcHR9O1xuIiwiaW1wb3J0IHtJbnB1dFNjcmlwdH0gZnJvbSAnLi9JbnB1dFNjcmlwdCc7XG5pbXBvcnQge0FuaW1hdGlvblNjcmlwdH0gZnJvbSAnLi9BbmltYXRpb25TY3JpcHQnO1xuaW1wb3J0IHtGb3JjZUlucHV0U2NyaXB0fSBmcm9tICcuL0ZvcmNlSW5wdXRTY3JpcHQnO1xuaW1wb3J0IHtHb2FsU2NyaXB0fSBmcm9tICcuL0dvYWxTY3JpcHQnO1xuaW1wb3J0IHtJbml0aWFsaXplV29ybGR9IGZyb20gJy4vSW5pdGlhbGl6ZVdvcmxkJztcbmltcG9ydCB7UmVzZXRQb3NpdGlvblNjcmlwdH0gZnJvbSAnLi9SZXNldFBvc2l0aW9uU2NyaXB0JztcbmltcG9ydCB7UG9pbnRTY3JpcHR9IGZyb20gJy4vUG9pbnRTY3JpcHQnO1xuXG5jb25zdCBzY3JpcHRzID0ge1xuICAvLyBBZGQgc2NyaXB0cyBoZXJlLCByZW1lbWJlciB0byBpbXBvcnRcbiAgaW5wdXRTY3JpcHQ6IElucHV0U2NyaXB0LFxuICBmb3JjZUlucHV0U2NyaXB0OiBGb3JjZUlucHV0U2NyaXB0LFxuICBhbmltYXRpb25TY3JpcHQ6IEFuaW1hdGlvblNjcmlwdCxcbiAgZ29hbFNjcmlwdDogR29hbFNjcmlwdCxcbiAgaW5pdGlhbGl6ZVdvcmxkOiBJbml0aWFsaXplV29ybGQsXG4gIHJlc2V0UG9zaXRpb25TY3JpcHQ6IFJlc2V0UG9zaXRpb25TY3JpcHQsXG4gIHBvaW50U2NyaXB0OiBQb2ludFNjcmlwdFxufTtcblxuZXhwb3J0IHtzY3JpcHRzIGFzIFNjcmlwdHN9O1xuIiwiaW1wb3J0IHtsb2d9IGZyb20gJ0xvZyc7XG5cbi8qKlxuICogUGFyZW50IGNsYXNzIGZvciBzeXN0ZW1zLiBBIHN5c3RlbSBpcyBydW4gZm9yIGFsbCBlbnRpdGVzIG9uY2UgZWFjaCB1cGRhdGVcbiAqIGxvb3AuIEFsbCBjaGFuZ2VzIHRvIGVudGl0aWVzIHNob3VsZCBoYXBwZW4gc29sZWx5IHZpYSBzeXN0ZW1zLlxuICovXG5jbGFzcyBTeXN0ZW0ge1xuICBjb25zdHJ1Y3RvcigpIHt9XG5cbi8qKlxuICAqIEluaXQgcnVucyBhZnRlciBnYW1lIGhhcyBiZWVuIGluc3RhbnRpYXRlZFxuICAqL1xuICBpbml0KHJvb3RFbnRpdHkpIHt9XG5cbiAgdXBkYXRlRW50aXRpZXMoZW50aXR5LCByb290RW50aXR5LCBkZWx0YSkge1xuICAgIGVudGl0eS5jaGlsZHJlbi5mb3JFYWNoKChjaGlsZCkgPT4ge1xuICAgICAgdGhpcy51cGRhdGVFbnRpdGllcyhjaGlsZCwgcm9vdEVudGl0eSwgZGVsdGEpO1xuICAgIH0pO1xuICAgIHRoaXMuYXBwbHlTeXN0ZW0oZW50aXR5LCByb290RW50aXR5LCBkZWx0YSk7XG4gIH1cblxuICBoYW5kbGVFdmVudHMoKSB7XG5cbiAgfVxuXG4vKipcbiAgKiBBbiBpbXBsZW1lbnRlZCBTeXN0ZW0gc2hvdWxkIG92ZXJyaWRlIHRoaXMgbWV0aG9kLiBUaGlzIGlzIHRoZSBzeXN0ZW0nc1xuICAqIG1haW4gbWV0aG9kLCBhbmQgaXMgYXBwbGllZCB0byBhbGwgZW50aXRpZXMuXG4gICovXG4gLyoqXG4gICogQW4gaW1wbGVtZW50ZWQgU3lzdGVtIHNob3VsZCBvdmVycmlkZSB0aGlzIG1ldGhvZC4gVGhpcyBpcyB0aGUgc3lzdGVtJ3NcbiAgKiBtYWluIG1ldGhvZCwgYW5kIGlzIGFwcGxpZWQgdG8gYWxsIGVudGl0aWVzLlxuICAqXG4gICogQHBhcmFtICB7RW50aXR5fSBlbnRpdHkgICAgIEVudGl0eSB0byBhcHBseSB0by5cbiAgKiBAcGFyYW0gIHtFbnRpdHl9IHJvb3RFbnRpdHkgVG9wbW9zdCBlbnRpdHkgZm9yIHdoaWNoIHN5c3RlbSBpcyBhcHBsaWVkLiBDYW5cbiAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmUgdXNlZCB0byBhY2Nlc3Mgb3RoZXIgZW50aXRpZXMgKFdBUk5JTkc6XG4gICogICAgICAgICAgICAgICAgICAgICAgICAgICAgIG90aGVyIGVudGl0aWVzIHNob3VsZCBub3QgYmUgbW9kaWZpZWRcbiAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXh0ZXJuYWxseSEgVGhpcyBjYW4gY2F1c2UgdW5leHBlY3RlZFxuICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiZWhhdmlvdXIuKVxuICAqIEBwYXJhbSAge251bWJlcn0gZGVsdGEgICAgICBUaW1lIHNpbmNlIGxhc3QgdXBkYXRlXG4gICovXG4gIGFwcGx5U3lzdGVtKGVudGl0eSwgcm9vdEVudGl0eSwgZGVsdGEpIHtcbiAgICBsb2cud2FybignU3lzdGVtIGFwcGx5IG5vdCBkZWZpbmVkJyk7XG4gIH1cblxuLyoqXG4gKiBSdW4gb25jZSBmb3IgZWFjaCB1cGRhdGUuXG4gKlxuICogQHBhcmFtICB7RW50aXR5fSByb290RW50aXR5IFRvcG1vc3QgZW50aXR5LiBBbGwgZW50aXRpZXMgYmVsb3cgaXQgYXJlIHVwZGF0ZWRcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoaW5jbHVkaW5nIGl0c2VsZikuXG4gKiBAcGFyYW0gIHtudW1iZXJ9IGRlbHRhICAgICAgVGltZSBzaW5jZSBsYXN0IHVwZGF0ZVxuICovXG4gIHVwZGF0ZVN5c3RlbShyb290RW50aXR5LCBkZWx0YSkge31cblxuLyoqXG4gKiBVcGRhdGVzIHRoZSBzeXN0ZW0gYW5kIGl0cyBlbnRpdGllcywgYW5kIGhhbmRsZXMgZXZlbnRzLiBTaG91bGQgbm90IGJlXG4gKiBvdmVycmlkZW4uXG4gKlxuICogQHBhcmFtICB7RW50aXR5fSByb290RW50aXR5IFRvcG1vc3QgZW50aXR5LiBBbGwgZW50aXRpZXMgYmVsb3cgaXQgYXJlIHVwZGF0ZWRcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoaW5jbHVkaW5nIGl0c2VsZikuXG4gKiBAcGFyYW0gIHtudW1iZXJ9IGRlbHRhICAgICAgVGltZSBzaW5jZSBsYXN0IHVwZGF0ZVxuICovXG4gIHVwZGF0ZShyb290RW50aXR5LCBkZWx0YSkge1xuICAgIHRoaXMudXBkYXRlU3lzdGVtKHJvb3RFbnRpdHksIGRlbHRhKTtcbiAgICB0aGlzLnVwZGF0ZUVudGl0aWVzKHJvb3RFbnRpdHksIHJvb3RFbnRpdHksIGRlbHRhKTtcbiAgICB0aGlzLmhhbmRsZUV2ZW50cygpO1xuICB9XG5cbn1cblxuXG5leHBvcnQge1N5c3RlbX07XG4iLCJpbXBvcnQge1N5c3RlbX0gZnJvbSAnU3lzdGVtJztcbmltcG9ydCB7bG9nfSBmcm9tICdMb2cnO1xuXG4vKipcbiAqIEhhbmRsZXMgdGhlIGV2ZW50cyBvZiBhbGwgZW50aXRpZXNcbiAqL1xuY2xhc3MgRXZlbnRTeXN0ZW0gZXh0ZW5kcyBTeXN0ZW0ge1xuICBhcHBseVN5c3RlbShlbnRpdHksIHJvb3RFbnRpdHksIGRlbHRhKSB7XG4gICAgaWYgKGVudGl0eS5oYW5kbGVFdmVudHMpIHtcbiAgICAgIGVudGl0eS5oYW5kbGVFdmVudHMoKTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IHtFdmVudFN5c3RlbX07XG4iLCJpbXBvcnQge1N5c3RlbX0gZnJvbSAnU3lzdGVtJztcbmltcG9ydCB7bG9nfSBmcm9tICdMb2cnO1xuaW1wb3J0IGNmZyBmcm9tICdjb25maWcuanNvbic7XG5pbXBvcnQge0V2ZW50TWFufSBmcm9tICdNYW5hZ2Vycy9FdmVudE1hbmFnZXInO1xuaW1wb3J0IHtQaHlzaWNzVXRpbH0gZnJvbSAnVXRpbC9QaHlzaWNzVXRpbCc7XG5cbmNsYXNzIFBoeXNpY3NTeXN0ZW0gZXh0ZW5kcyBTeXN0ZW0ge1xuICBjb25zdHJ1Y3Rvcih0aW1lU3RlcCA9IDMsIG1heElQRiA9IDE2LCBpbnRlZ3JhdG9yID0gJ3ZlcmxldCcpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuYm94MkRTaG9ydGN1dHMoKTtcbiAgICB0aGlzLnBhdXNlZCA9IHRydWU7XG4gICAgdGhpcy5zcGVlZCA9IDEuMDtcbiAgICBjb25zdCBncmF2aXR5ID0gbmV3IGIyVmVjMigwLCAwLjApO1xuICAgIGNvbnN0IGFsbG93U2xlZXAgPSBmYWxzZTtcbiAgICB0aGlzLndvcmxkID0gbmV3IGIyV29ybGQoZ3Jhdml0eSk7XG5cbiAgICB0aGlzLmJvZGllcyA9IFtdO1xuXG4gICAgLy8gdmFyIGJkX2dyb3VuZCA9IG5ldyBCb3gyRC5iMkJvZHlEZWYoKTtcbiAgICAvLyB2YXIgZ3JvdW5kID0gd29ybGQuQ3JlYXRlQm9keShiZF9ncm91bmQpO1xuICAgIC8vIHZhciBzaGFwZTAgPSBuZXcgQm94MkQuYjJFZGdlU2hhcGUoKTtcbiAgICAvLyBzaGFwZTAuU2V0KG5ldyBCb3gyRC5iMlZlYzIoLTQwLjAsIC02LjApLCBuZXcgQm94MkQuYjJWZWMyKDQwLjAsIC02LjApKTtcbiAgICAvLyBncm91bmQuQ3JlYXRlRml4dHVyZShzaGFwZTAsIDAuMCk7XG5cblxuICAgIHRoaXMudGltZXIgPSAwO1xuICAgIHRoaXMucGh5c2ljc1NjYWxlID0gMTY7XG4gICAgLy8gdGhpcy5lbmdpbmUgPSBNYXR0ZXIuRW5naW5lLmNyZWF0ZSgpO1xuICAgIC8vIHRoaXMuZW5naW5lLnRpbWluZy50aW1lU2NhbGUgPSAwLjU7XG4gICAgLy8gdGhpcy53b3JsZCA9IHRoaXMuZW5naW5lLndvcmxkO1xuICAgIC8vIHRoaXMud29ybGQuZ3Jhdml0eSA9IHt4OiAwLCB5OiAwfTtcbiAgICB0aGlzLmV2ZW50cyA9IFtdO1xuICAgIHRoaXMuZXZlbnRUeXBlcyA9IFsncGh5c2ljcyddO1xuICAgIGlmIChjZmcuZGVidWdNb2RlKSB0aGlzLmRlYnVnKCk7XG4gIH1cblxuICBib3gyRFNob3J0Y3V0cygpIHtcbiAgICB3aW5kb3cuYjJWZWMyID0gQm94MkQuYjJWZWMyO1xuICAgIHdpbmRvdy5iMkFBQkIgPSBCb3gyRC5iMkFBQkI7XG4gICAgd2luZG93LmIyQm9keURlZiA9IEJveDJELmIyQm9keURlZjtcbiAgICB3aW5kb3cuYjJCb2R5ID0gQm94MkQuYjJCb2R5O1xuICAgIHdpbmRvdy5iMkZpeHR1cmVEZWYgPSBCb3gyRC5iMkZpeHR1cmVEZWY7XG4gICAgd2luZG93LmIyRml4dHVyZSA9IEJveDJELmIyRml4dHVyZTtcbiAgICB3aW5kb3cuYjJXb3JsZCA9IEJveDJELmIyV29ybGQ7XG4gICAgd2luZG93LmIyTWFzc0RhdGEgPSBCb3gyRC5iMk1hc3NEYXRhO1xuICAgIHdpbmRvdy5iMlBvbHlnb25TaGFwZSA9IEJveDJELmIyUG9seWdvblNoYXBlO1xuICAgIHdpbmRvdy5iMkNpcmNsZVNoYXBlID0gQm94MkQuYjJDaXJjbGVTaGFwZTtcbiAgICB3aW5kb3cuYjJEZWJ1Z0RyYXcgPSBCb3gyRC5iMkRlYnVnRHJhdztcbiAgICB3aW5kb3cuYjJNb3VzZUpvaW50RGVmID0gIEJveDJELmIyTW91c2VKb2ludERlZjtcbiAgfVxuXG4gIGluaXQocm9vdEVudGl0eSkge1xuICAgIGxvZy5kZWJ1ZyhcIkluaXRpYWxpemluZyBQaHlzaWNzIFN5c3RlbVwiKTtcbiAgICBFdmVudE1hbi5yZWdpc3Rlckxpc3RlbmVyKHRoaXMpO1xuICB9XG5cbiAgZGVidWcoKSB7XG5cbiAgfVxuXG4gIGFkZEV2ZW50KGV2dCkge1xuICAgIHRoaXMuZXZlbnRzLnB1c2goZXZ0KTtcbiAgfVxuXG4gIGhhbmRsZUV2ZW50cygpIHtcbiAgICB0aGlzLmV2ZW50cy5mb3JFYWNoKChldnQpID0+IHtcbiAgICAgIGlmIChldnQuZXZlbnRUeXBlID09PSAncGh5c2ljc19wYXVzZScpIHtcbiAgICAgICAgbG9nLmRlYnVnKFwiUEFVU0UgUEhZU0lDU1wiKTtcbiAgICAgICAgdGhpcy5wYXVzZWQgPSB0cnVlO1xuICAgICAgfSBlbHNlIGlmIChldnQuZXZlbnRUeXBlID09PSAncGh5c2ljc19wbGF5Jykge1xuICAgICAgICBsb2cuZGVidWcoXCJSVU4gUEhZU0lDU1wiKTtcbiAgICAgICAgdGhpcy5wYXVzZWQgPSBmYWxzZTtcbiAgICAgIH0gZWxzZSBpZiAoZXZ0LmV2ZW50VHlwZSA9PT0gJ3BoeXNpY3Nfc3BlZWQnKSB7XG4gICAgICAgIGxvZy5kZWJ1ZyhcIkFkanVzdGluZyBwaHlzaWNzIHNwZWVkOiBcIiArIGV2dC5wYXJhbWV0ZXJzLnNwZWVkKTtcbiAgICAgICAgdGhpcy5zcGVlZCA9IGV2dC5wYXJhbWV0ZXJzLnNwZWVkO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHRoaXMuZXZlbnRzID0gW107XG4gIH1cblxuICBhcHBseVN5c3RlbShlbnRpdHksIHJvb3RFbnRpdHksIGRlbHRhKSB7XG4gICAgaWYgKGVudGl0eS5waHlzaWNzKSB7XG4gICAgICAvLyBBZGQgdGhlIGVudGl0eSBpZiBpdCBpc24ndCBpbiB0aGUgd29ybGQgeWV0XG4gICAgICBpZiAoIWVudGl0eS5waHlzaWNzLmluV29ybGQpIHtcbiAgICAgICAgZW50aXR5LnBoeXNpY3MuYm9keSA9IHRoaXMud29ybGQuQ3JlYXRlQm9keShlbnRpdHkucGh5c2ljcy5ib2R5RGVmKTtcbiAgICAgICAgbGV0IGJvZCA9IGVudGl0eS5waHlzaWNzLmJvZHk7XG4gICAgICAgIGVudGl0eS5waHlzaWNzLmZpeHR1cmUgPSBib2QuQ3JlYXRlRml4dHVyZShlbnRpdHkucGh5c2ljcy5maXhEZWYpO1xuXG4gICAgICAgIHRoaXMuYm9kaWVzLnB1c2goYm9kKTtcblxuICAgICAgICBib2QuU2V0QXdha2UoMSk7XG4gICAgICAgIGJvZC5TZXRBY3RpdmUoMSk7XG4gICAgICAgIC8vIE1hdHRlci5Xb3JsZC5hZGQodGhpcy53b3JsZCwgZW50aXR5LnBoeXNpY3MuYm9keSk7XG4gICAgICAgIGVudGl0eS5waHlzaWNzLmluV29ybGQgPSB0cnVlO1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhlbnRpdHkucGh5c2ljcy5maXh0dXJlKTtcbiAgICAgICAgLy8gY29uc29sZS5sb2coZW50aXR5LnBoeXNpY3MuYm9keS5HZXRQb3NpdGlvbigpLmdldF94KCkpO1xuICAgICAgfVxuICAgICAgLy8gVXBkYXRlIHRoZSBwb3NpdGlvbiBvZiB0aGUgZW50aXR5IHRvIHRoYXQgb2YgdGhlXG4gICAgICAvLyBib2R5XG5cbiAgICAgIGxldCBkYXRhID0gUGh5c2ljc1V0aWwub2JqZWN0RGF0YShlbnRpdHkucGh5c2ljcy5ib2R5KTtcbiAgICAgIGVudGl0eS5wb3NpdGlvbiA9IHtcbiAgICAgICAgeDogZGF0YS54LFxuICAgICAgICB5OiBkYXRhLnlcbiAgICAgIH07XG5cbiAgICAgIGVudGl0eS5yb3RhdGlvbiA9IGRhdGEuYW5nbGU7XG4gICAgfVxuICB9XG5cblxuICB1cGRhdGVTeXN0ZW0ocm9vdEVudGl0eSwgZGVsdGEpIHtcbiAgICBpZiAoIXRoaXMucGF1c2VkKSB7XG4gICAgICB0aGlzLndvcmxkLlN0ZXAoZGVsdGEvMTAwMC4wICogdGhpcy5zcGVlZCwgMiwgMik7XG4gICAgfVxuICAgIHRoaXMuaGFuZGxlRXZlbnRzKCk7XG5cbiAgICBsZXQgYWxsU2xlZXBpbmcgPSB0cnVlO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5ib2RpZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGJvZHkgPSB0aGlzLmJvZGllc1tpXTtcbiAgICAgIGNvbnN0IHZlbCA9IGJvZHkuR2V0TGluZWFyVmVsb2NpdHkoKTtcbiAgICAgIGlmIChNYXRoLmFicyh2ZWwuZ2V0X3goKSkgPj0gY2ZnLm1pblNsZWVwVmVsIHx8IE1hdGguYWJzKHZlbC5nZXRfeSgpKSA+PSBjZmcubWluU2xlZXBWZWwpIHtcbiAgICAgICAgYWxsU2xlZXBpbmcgPSBmYWxzZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChhbGxTbGVlcGluZykge1xuICAgICAgRXZlbnRNYW4ucHVibGlzaCh7XG4gICAgICAgIGV2ZW50VHlwZTogJ3BoeXNpY3Nfc2xlZXBpbmcnLFxuICAgICAgICBwYXJhbWV0ZXJzOiB7fVxuICAgICAgfSk7XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCB7UGh5c2ljc1N5c3RlbX07XG4iLCJpbXBvcnQge1N5c3RlbX0gZnJvbSAnU3lzdGVtJztcbmltcG9ydCB7bG9nfSBmcm9tICdMb2cnO1xuXG5jbGFzcyBTY3JpcHRTeXN0ZW0gZXh0ZW5kcyBTeXN0ZW0ge1xuXG4gIGluaXQocm9vdEVudGl0eSkge1xuICAgIGxvZy5kZWJ1ZyhcIkluaXRpYWxpemluZyBTY3JpcHRTeXN0ZW1cIik7XG4gIH1cblxuICBhcHBseVN5c3RlbShlbnRpdHksIHJvb3RFbnRpdHksIGRlbHRhKSB7XG4gICAgaWYgKGVudGl0eS5zY3JpcHRzKSB7XG4gICAgICBlbnRpdHkuc2NyaXB0cy5mb3JFYWNoKChzY3JpcHRPYmopID0+IHtcbiAgICAgICAgc2NyaXB0T2JqLnVwZGF0ZShlbnRpdHksIHJvb3RFbnRpdHksIGRlbHRhKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQge1NjcmlwdFN5c3RlbX07XG4iLCJpbXBvcnQge2xvZ30gZnJvbSAnTG9nJztcbmltcG9ydCBjZmcgZnJvbSAnY29uZmlnLmpzb24nO1xuXG5jbGFzcyBQaHlzaWNzVXRpbCB7XG4gIC8qKlxuICAgKiBDb252ZXJ0cyBhIHBoeXNpY3MgYm9keSBpbnRvIHBvc2l0aW9uYWwgZGF0YSAocG9zaXRpb24gYW5kIHJvdGF0aW9uKVxuICAgKiBAcGFyYW0gIHtiMkJvZHl9IGJvZHkgVGhlIGJvZHkgdG8gZXh0cmFjdCBkYXRhIGZyb21cbiAgICogQHJldHVybiB7T2JqZWN0fSAgICAgIFRoZSBkYXRhXG4gICAqL1xuICBzdGF0aWMgb2JqZWN0RGF0YShib2R5KSB7XG4gICAgbGV0IGRhdGEgPSB7fTtcbiAgICBjb25zdCBwb3MgPSBib2R5LkdldFBvc2l0aW9uKCk7XG4gICAgZGF0YS54ID0gcG9zLmdldF94KCkgKiBjZmcucGh5c2ljc1NjYWxlO1xuICAgIGRhdGEueSA9IHBvcy5nZXRfeSgpICogY2ZnLnBoeXNpY3NTY2FsZTtcbiAgICBkYXRhLmFuZ2xlID0gYm9keS5HZXRBbmdsZSgpO1xuICAgIHJldHVybiBkYXRhO1xuICB9XG5cbi8qKlxuICogQ29udmVydCBnYW1lIGNvb3JkaW5hdGVzIHRvIHBoeXNpY3MgY29vcmRpbmF0ZXNcbiAqIEBwYXJhbSAge1ZlYzJ9ICAgdmVjIFRoZSB2ZWN0b3IgdG8gY29udmVydFxuICogQHJldHVybiB7YjJWZWMyfSAgICAgVGhlIGNvbnZlcnRlZCB2ZWN0b3JcbiAqL1xuICBzdGF0aWMgd29ybGRUb1BoeXNpY3ModmVjKSB7XG4gICAgcmV0dXJuIG5ldyBiMlZlYzIodmVjLngvY2ZnLnBoeXNpY3NTY2FsZSwgdmVjLnkvY2ZnLnBoeXNpY3NTY2FsZSk7XG4gIH1cbn1cblxuZXhwb3J0IHtQaHlzaWNzVXRpbH07XG4iLCJtb2R1bGUuZXhwb3J0cz17XG5cbiAgXCJsZWZ0XCI6IDM3LFxuICBcInVwXCI6IDM4LFxuICBcInJpZ2h0XCI6IDM5LFxuICBcImRvd25cIjogNDAsXG59XG4iXX0=
