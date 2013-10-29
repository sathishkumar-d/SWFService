/*!
 * [SWFService](http://github.com/CodeCatalyst/SWFService) v2.0.1
 * Copyright (c) 2008-2013 [CodeCatalyst, LLC](http://codecatalyst.com)
 * Open source under the [MIT License](http://en.wikipedia.org/wiki/MIT_License).
 */

/*
 * [promise.coffee](http://github.com/CodeCatalyst/promise.coffee) v1.0.5
 * Copyright (c) 2012-2013 [CodeCatalyst, LLC](http://www.codecatalyst.com/).
 * Open source under the [MIT License](http://en.wikipedia.org/wiki/MIT_License).
 */
// Generated by CoffeeScript 1.6.3
(function() {
  var CallbackQueue, Consequence, Deferred, Promise, Resolver, callbackQueue, enqueue, isFunction, isObject, nextTick, target;

  nextTick = (typeof process !== "undefined" && process !== null ? process.nextTick : void 0) != null ? process.nextTick : typeof setImmediate !== "undefined" && setImmediate !== null ? setImmediate : function(task) {
    return setTimeout(task, 0);
  };

  CallbackQueue = (function() {
    function CallbackQueue() {
      var execute, queuedCallbackCount, queuedCallbacks;
      queuedCallbacks = new Array(1e4);
      queuedCallbackCount = 0;
      execute = function() {
        var index;
        index = 0;
        while (index < queuedCallbackCount) {
          queuedCallbacks[index]();
          queuedCallbacks[index] = null;
          index++;
        }
        queuedCallbackCount = 0;
      };
      this.schedule = function(callback) {
        queuedCallbacks[queuedCallbackCount++] = callback;
        if (queuedCallbackCount === 1) {
          nextTick(execute);
        }
      };
    }

    return CallbackQueue;

  })();

  callbackQueue = new CallbackQueue();

  enqueue = function(task) {
    return callbackQueue.schedule(task);
  };

  isFunction = function(value) {
    return value && typeof value === 'function';
  };

  isObject = function(value) {
    return value && typeof value === 'object';
  };

  Consequence = (function() {
    function Consequence(onFulfilled, onRejected) {
      this.onFulfilled = onFulfilled;
      this.onRejected = onRejected;
      this.resolver = new Resolver();
      this.promise = this.resolver.promise;
    }

    Consequence.prototype.trigger = function(action, value) {
      switch (action) {
        case 'fulfill':
          this.propagate(value, this.onFulfilled, this.resolver, this.resolver.resolve);
          break;
        case 'reject':
          this.propagate(value, this.onRejected, this.resolver, this.resolver.reject);
      }
    };

    Consequence.prototype.propagate = function(value, callback, resolver, resolverMethod) {
      if (isFunction(callback)) {
        enqueue(function() {
          var error;
          try {
            resolver.resolve(callback(value));
          } catch (_error) {
            error = _error;
            resolver.reject(error);
          }
        });
      } else {
        resolverMethod.call(resolver, value);
      }
    };

    return Consequence;

  })();

  Resolver = (function() {
    function Resolver() {
      this.promise = new Promise(this);
      this.consequences = [];
      this.completed = false;
      this.completionAction = null;
      this.completionValue = null;
    }

    Resolver.prototype.then = function(onFulfilled, onRejected) {
      var consequence;
      consequence = new Consequence(onFulfilled, onRejected);
      if (this.completed) {
        consequence.trigger(this.completionAction, this.completionValue);
      } else {
        this.consequences.push(consequence);
      }
      return consequence.promise;
    };

    Resolver.prototype.resolve = function(value) {
      var error, isHandled, self, thenFn;
      if (this.completed) {
        return;
      }
      try {
        if (value === this.promise) {
          throw new TypeError('A Promise cannot be resolved with itself.');
        }
        if ((isObject(value) || isFunction(value)) && isFunction(thenFn = value.then)) {
          isHandled = false;
          try {
            self = this;
            thenFn.call(value, function(value) {
              if (!isHandled) {
                isHandled = true;
                self.resolve(value);
              }
            }, function(error) {
              if (!isHandled) {
                isHandled = true;
                self.reject(error);
              }
            });
          } catch (_error) {
            error = _error;
            if (!isHandled) {
              this.reject(error);
            }
          }
        } else {
          this.complete('fulfill', value);
        }
      } catch (_error) {
        error = _error;
        this.reject(error);
      }
    };

    Resolver.prototype.reject = function(error) {
      if (this.completed) {
        return;
      }
      this.complete('reject', error);
    };

    Resolver.prototype.complete = function(action, value) {
      var consequence, _i, _len, _ref;
      this.completionAction = action;
      this.completionValue = value;
      this.completed = true;
      _ref = this.consequences;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        consequence = _ref[_i];
        consequence.trigger(this.completionAction, this.completionValue);
      }
      this.consequences = null;
    };

    return Resolver;

  })();

  Promise = (function() {
    function Promise(resolver) {
      this.then = function(onFulfilled, onRejected) {
        return resolver.then(onFulfilled, onRejected);
      };
    }

    return Promise;

  })();

  Deferred = (function() {
    function Deferred() {
      var resolver;
      resolver = new Resolver();
      this.promise = resolver.promise;
      this.resolve = function(value) {
        return resolver.resolve(value);
      };
      this.reject = function(error) {
        return resolver.reject(error);
      };
    }

    return Deferred;

  })();

  target = typeof exports !== "undefined" && exports !== null ? exports : window;

  target.Deferred = Deferred;

  target.defer = function() {
    return new Deferred();
  };

}).call(this);
// Generated by CoffeeScript 1.6.3
(function() {
  var DeferredEntityRegistry, EntitySet, SWFService, SWFServiceContext, SWFServiceContextManager, SWFServiceEventListenerProxy, SWFServiceOperationProxy, SWFServiceProxy, Timer, target;

  Timer = (function() {
    function Timer(duration) {
      var now, start;
      now = function() {
        return new Date().getTime();
      };
      start = now();
      this.elapsed = function() {
        return now() - start;
      };
      this.remaining = function() {
        return Math.max(duration - this.elapsed(), 0);
      };
      this.expired = function() {
        return this.elapsed() > duration;
      };
    }

    return Timer;

  })();

  EntitySet = (function() {
    function EntitySet(entityClass, entityKeyProperty) {
      this.entityClass = entityClass;
      this.entityKeyProperty = entityKeyProperty != null ? entityKeyProperty : 'id';
      this.entitiesByKey = {};
    }

    EntitySet.prototype.add = function(entity) {
      var entityKey;
      if (!(entity instanceof this.entityClass)) {
        throw new Error("Entity must be of type: " + this.entityClass.name + " to be added to this EntitySet.");
      }
      entityKey = entity[this.entityKeyProperty];
      if (this.exists(entityKey)) {
        throw new Error("An Entity with key: " + entityKey + " already exists in this EntitySet.");
      }
      this.entitiesByKey[entityKey] = entity;
      return entity;
    };

    EntitySet.prototype.remove = function(entity) {
      if (this.contains(entity)) {
        delete this.entitiesByKey[entity[this.entityKeyProperty]];
        return entity;
      }
      return null;
    };

    EntitySet.prototype.removeAll = function() {
      this.entitiesByKey = {};
    };

    EntitySet.prototype.get = function(key) {
      return this.entitiesByKey[key];
    };

    EntitySet.prototype.find = function(attributes) {
      var matches;
      matches = function(entity) {
        var attribute, attributeValue;
        for (attribute in attributes) {
          attributeValue = attributes[attribute];
          if (entity[attribute] !== attributeValue) {
            return false;
          }
        }
        return true;
      };
      return this.match(matches);
    };

    EntitySet.prototype.match = function(matcherFunction) {
      var entity, entityId, matchingEntities, _ref;
      matchingEntities = [];
      _ref = this.entitiesByKey;
      for (entityId in _ref) {
        entity = _ref[entityId];
        if (matcherFunction(entity)) {
          matchingEntities.push(entity);
        }
      }
      return matchingEntities;
    };

    EntitySet.prototype.contains = function(entity) {
      var entityKey;
      entityKey = entity[this.entityKeyProperty];
      return this.exists(entityKey) && entity === this.get(entityKey);
    };

    EntitySet.prototype.exists = function(key) {
      return this.entitiesByKey[key] != null;
    };

    EntitySet.prototype.toArray = function() {
      var entities, entity, entityId, _ref;
      entities = [];
      _ref = this.entitiesByKey;
      for (entityId in _ref) {
        entity = _ref[entityId];
        entities.push(entity);
      }
      return entities;
    };

    return EntitySet;

  })();

  DeferredEntityRegistry = (function() {
    function DeferredEntityRegistry(entityClass, entityKeyProperty) {
      this.entityClass = entityClass;
      this.entityKeyProperty = entityKeyProperty != null ? entityKeyProperty : 'id';
      this.entities = new EntitySet(this.entityClass);
      this.pendingEntityRequestsByEntityId = {};
    }

    DeferredEntityRegistry.prototype.get = function(entityId, timeout) {
      var deferred, entity, _base,
        _this = this;
      entity = this.entities.get(entityId);
      if (entity != null) {
        deferred = new Deferred();
        deferred.resolve(entity);
        return deferred.promise;
      } else {
        deferred = new Deferred();
        if (timeout != null) {
          setTimeout(function() {
            deferred.reject(new Error("Request for " + _this.entityClass.name + " with " + _this.entityKeyProperty + ": \"" + entityId + "\" timed out."));
          }, timeout);
        }
        if ((_base = this.pendingEntityRequestsByEntityId)[entityId] == null) {
          _base[entityId] = [];
        }
        this.pendingEntityRequestsByEntityId[entityId].push(deferred);
        return deferred.promise;
      }
    };

    DeferredEntityRegistry.prototype.register = function(entity) {
      var entityId, pendingEntityRequest, pendingEntityRequests, _i, _len;
      this.entities.add(entity);
      entityId = entity[this.entityKeyProperty];
      pendingEntityRequests = this.pendingEntityRequestsByEntityId[entityId];
      for (_i = 0, _len = pendingEntityRequests.length; _i < _len; _i++) {
        pendingEntityRequest = pendingEntityRequests[_i];
        pendingEntityRequest.resolve(entity);
      }
      delete this.pendingEntityRequestsByEntityId[entityId];
      return entity;
    };

    DeferredEntityRegistry.prototype.unregister = function(entity) {
      this.entities.remove(entity);
      return entity;
    };

    return DeferredEntityRegistry;

  })();

  SWFServiceProxy = (function() {
    function SWFServiceProxy(serviceContext, id, descriptor) {
      var accessor, createGetter, createMethod, createSetter, method, variable, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2;
      this.id = id;
      createGetter = function(propertyName) {
        return function() {
          return serviceContext.getServiceProperty(id, propertyName);
        };
      };
      createSetter = function(propertyName) {
        return function(value) {
          serviceContext.setServiceProperty(id, propertyName, value);
        };
      };
      createMethod = function(methodName) {
        return function() {
          var args;
          args = Array.prototype.slice.call(arguments);
          return serviceContext.executeServiceMethod(id, methodName, args);
        };
      };
      _ref = descriptor.accessors;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        accessor = _ref[_i];
        Object.defineProperty(this, accessor.name, {
          writeable: accessor.access !== 'readonly',
          get: createGetter(accessor.name),
          set: createSetter(accessor.name)
        });
      }
      _ref1 = descriptor.variables;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        variable = _ref1[_j];
        Object.defineProperty(this, variable.name, {
          get: createGetter(variable.name),
          set: createSetter(variable.name)
        });
      }
      _ref2 = descriptor.methods;
      for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
        method = _ref2[_k];
        this[method.name] = createMethod(method.name);
      }
      if (descriptor.isEventDispatcher) {
        this.addEventListener = function(eventType, listenerFunction, useCapture, priority, weakReference) {
          if (useCapture == null) {
            useCapture = false;
          }
          if (priority == null) {
            priority = 0;
          }
          if (weakReference == null) {
            weakReference = false;
          }
          serviceContext.addServiceEventListener(id, eventType, listenerFunction, useCapture, priority, weakReference);
        };
        this.removeEventListener = function(eventType, listenerFunction, useCapture) {
          if (useCapture == null) {
            useCapture = false;
          }
          serviceContext.removeServiceEventListener(id, eventType, listenerFunction, useCapture);
        };
      }
    }

    return SWFServiceProxy;

  })();

  SWFServiceOperationProxy = (function() {
    function SWFServiceOperationProxy(id, serviceId, methodName, args) {
      var deferred;
      this.id = id;
      this.serviceId = serviceId;
      this.methodName = methodName;
      this.args = args;
      deferred = new Deferred();
      this.promise = deferred.promise, this.resolve = deferred.resolve, this.reject = deferred.reject;
    }

    return SWFServiceOperationProxy;

  })();

  SWFServiceEventListenerProxy = (function() {
    function SWFServiceEventListenerProxy(id, serviceId, eventType, listenerFunction, useCapture, priority, useWeakReference) {
      this.id = id;
      this.serviceId = serviceId;
      this.eventType = eventType;
      this.listenerFunction = listenerFunction;
      this.useCapture = useCapture != null ? useCapture : false;
      this.priority = priority != null ? priority : 0;
      this.useWeakReference = useWeakReference != null ? useWeakReference : false;
    }

    SWFServiceEventListenerProxy.prototype.redispatch = function(event) {
      return this.listenerFunction(event);
    };

    return SWFServiceEventListenerProxy;

  })();

  SWFServiceContext = (function() {
    function SWFServiceContext(id) {
      this.id = id;
      this.serviceProxyRegistry = new DeferredEntityRegistry(SWFServiceProxy);
      this.serviceOperationProxies = new EntitySet(SWFServiceOperationProxy);
      this.serviceEventListenerProxies = new EntitySet(SWFServiceEventListenerProxy);
      return;
    }

    SWFServiceContext.prototype.get = function(serviceId, timeout) {
      return this.serviceProxyRegistry.get(serviceId, timeout);
    };

    SWFServiceContext.prototype.getServiceDescriptor = function(serviceId) {
      return this.swf.SWFServiceContext_getServiceDescriptor(serviceId);
    };

    SWFServiceContext.prototype.getServiceProperty = function(serviceId, propertyName) {
      return this.swf.SWFServiceContext_getServiceProperty(serviceId, propertyName);
    };

    SWFServiceContext.prototype.setServiceProperty = function(serviceId, propertyName, value) {
      this.swf.SWFServiceContext_setServiceProperty(serviceId, propertyName, value);
    };

    SWFServiceContext.prototype.executeServiceMethod = function(serviceId, methodName, args) {
      var cleanUp, returnValue, serviceOperationProxy,
        _this = this;
      returnValue = this.swf.SWFServiceContext_executeServiceMethod(serviceId, methodName, args);
      if (returnValue.pending) {
        serviceOperationProxy = new SWFServiceOperationProxy(returnValue.operationId, serviceId, methodName, args);
        this.serviceOperationProxies.add(serviceOperationProxy);
        cleanUp = function() {
          return _this.serviceOperationProxies.remove(serviceOperationProxy);
        };
        serviceOperationProxy.promise.then(cleanUp, cleanUp);
        return serviceOperationProxy.promise;
      }
      return returnValue.value;
    };

    SWFServiceContext.prototype.addServiceEventListener = function(serviceId, eventType, listenerFunction, useCapture, priority, weakReference) {
      var serviceEventListenerProxyId;
      serviceEventListenerProxyId = this.swf.SWFServiceContext_addServiceEventListener(serviceId, eventType, useCapture, priority, weakReference);
      this.serviceEventListenerProxies.add(new SWFServiceEventListenerProxy(serviceEventListenerProxyId, serviceId, eventType, listenerFunction, useCapture, priority, weakReference));
    };

    SWFServiceContext.prototype.removeServiceEventListener = function(serviceId, eventType, listenerFunction, useCapture) {
      var serviceEventListenerProxy;
      serviceEventListenerProxy = this.serviceEventListenerProxies.find({
        serviceId: serviceId,
        eventType: eventType,
        listenerFunction: listenerFunction,
        useCapture: useCapture
      })[0];
      if (serviceEventListenerProxy != null) {
        this.swf.SWFServiceContext_removeServiceEventListener(serviceId, serviceEventListenerProxy.id);
        this.serviceEventListenerProxies.remove(serviceEventListenerProxy);
      }
    };

    SWFServiceContext.prototype.onServiceRegister = function(serviceId, serviceDescriptor) {
      this.serviceProxyRegistry.register(new SWFServiceProxy(this, serviceId, serviceDescriptor));
    };

    SWFServiceContext.prototype.onServiceExecuteComplete = function(serviceId, serviceOperationProxyId, action, value) {
      var serviceOperationProxy;
      serviceOperationProxy = this.serviceOperationProxies.get(serviceOperationProxyId);
      if (serviceOperationProxy != null) {
        serviceOperationProxy[action](value);
      }
    };

    SWFServiceContext.prototype.onServiceEvent = function(serviceId, serviceEventListenerProxyId, event) {
      return this.serviceEventListenerProxies.get(serviceEventListenerProxyId).redispatch(event);
    };

    return SWFServiceContext;

  })();

  SWFServiceContextManager = (function() {
    function SWFServiceContextManager() {
      this.serviceContexts = new EntitySet(SWFServiceContext);
    }

    SWFServiceContextManager.prototype.add = function(serviceContext) {
      return this.serviceContexts.add(serviceContext);
    };

    SWFServiceContextManager.prototype.getById = function(serviceContextId) {
      return this.serviceContexts.get(serviceContextId);
    };

    SWFServiceContextManager.prototype.getBySWFId = function(swfId, timeout) {
      var deferred, intervalId, timer,
        _this = this;
      deferred = new Deferred();
      timer = new Timer(timeout);
      intervalId = setInterval(function() {
        var error, serviceContext, serviceContextId, swf;
        try {
          swf = document.getElementById(swfId);
          serviceContextId = swf.SWFServiceContext_getId();
          serviceContext = _this.serviceContexts.get(serviceContextId);
        } catch (_error) {
          error = _error;
        }
        if ((serviceContextId != null) && (serviceContext != null)) {
          clearInterval(intervalId);
          if (serviceContext.swf == null) {
            serviceContext.swf = swf;
          }
          deferred.resolve(serviceContext);
        } else {
          if (timer.expired()) {
            clearInterval(intervalId);
            deferred.reject(new Error('SWFService timed out attempting to access the requested SWF.'));
          }
        }
      }, 100);
      return deferred.promise;
    };

    return SWFServiceContextManager;

  })();

  SWFService = (function() {
    function SWFService() {
      this.serviceContextManager = new SWFServiceContextManager();
    }

    SWFService.prototype.get = function(swfId, serviceId, timeout) {
      var timer;
      if (timeout == null) {
        timeout = 30000;
      }
      timer = new Timer(timeout);
      return this.serviceContextManager.getBySWFId(swfId, timer.remaining()).then(function(serviceContext) {
        return serviceContext.get(serviceId, timer.remaining());
      });
    };

    SWFService.prototype.onInit = function(serviceContextId) {
      this.serviceContextManager.add(new SWFServiceContext(serviceContextId));
    };

    SWFService.prototype.onServiceRegister = function(serviceContextId, serviceId, serviceDescriptor) {
      this.serviceContextManager.getById(serviceContextId).onServiceRegister(serviceId, serviceDescriptor);
    };

    SWFService.prototype.onServiceExecuteComplete = function(serviceContextId, serviceId, operationId, action, value) {
      this.serviceContextManager.getById(serviceContextId).onServiceExecuteComplete(serviceId, operationId, action, value);
    };

    SWFService.prototype.onServiceEvent = function(serviceContextId, serviceId, listenerId, event) {
      return this.serviceContextManager.getById(serviceContextId).onServiceEvent(serviceId, listenerId, event);
    };

    return SWFService;

  })();

  target = typeof exports !== "undefined" && exports !== null ? exports : window;

  target.SWFService = new SWFService();

}).call(this);
