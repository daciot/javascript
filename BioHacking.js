Biohacking = {};

Biohacking.KIND = {
  11: "BATH",
  9: "DEFECATE",
  3: "DRINK",
  2: "EAT",
  5: "HUNGRY",
  10: "SEX",
  6: "SLEEP",
  8: "URINATE",  
  7: "WAKEUP",    
  1: "WEIGHT",
  4: "WORKOUT"
};

Biohacking.Fields = {};

Biohacking.Fields.Field = function() {
  
  this._listeners = {};
  this.el;
  
  this.register = function( events ) {
    events = events || {};
    Object.keys(events).forEach(function(event) {
      this._listeners[event] = events[event];
    }, this);
  };
  
  this.fireEvent = function(event) {
    var listener = this._listeners[event];
    if( listener ) {
      listener.handler.call( listener.scope || this, this );
    }
  };
  
  this.setValue = function(value){
    if(value){
      this.el.setAttribute('value', value);
      this.el.value =  value;  
      this.value = value;
    }
    
  }
  
  this.render = function(config){
    this.name = config.name;
    this.value = '';
    this.el = document.createElement("div");
    return this;
  };
  
  this.toggle = function() {
    this.el.style.display = (this.el.style.display === "none")? "flex":"none";
  };
  
  this.show = function(){
    this.el.style.display = "flex";
  }
  
  this.hide = function(){
    this.el.style.display = "none";
  }
  
};

Biohacking.Fields.LookupOption = function() {
  
  Biohacking.Fields.Field.apply(this, arguments);
      
  this.el = document.createElement("li");
  
  this.deselect = function() {
    this.el.setAttribute("class", "list-group-item");
  };
  
  this.select = function() {
    this.el.setAttribute("class", "list-group-item active");
  }
    
  this.render = function(config) {
    
    this.el.setAttribute("name", config.key);
    this.el.setAttribute("class", "list-group-item");
    this.el.innerHTML = config.value;
    this.value = this.el.innerHTML;
    this.el.addEventListener("click", function(evt){
      evt.preventDefault();          
      this.select();
      this.fireEvent("selected");
    }.bind(this) );
    
    return this;
    
  };
  
};


Biohacking.Fields.Lookup = function() {
  Biohacking.Fields.Field.apply(this, arguments);
  
  this.options = [];
  
  this.sorter = function(a, b){
    if (a.el.innerHTML > b.el.innerHTML) {
      return 1;
    }
    if (a.el.innerHTML < b.el.innerHTML) {
      return -1;
    }
    return 0;
  };
  
  this.deselectAll = function(lookupOption) {
    this.options.forEach(function(option) {
      if(option !== lookupOption) option.deselect();
    });
  };
  
  this.createOption = function(config) {
    var option = new Biohacking.Fields.LookupOption;
    option.register({
      selected: {
        handler: function(lookupOption) {
          this.deselectAll(lookupOption);
          this.fireEvent("selected");
          this.value = lookupOption.el.innerText;
        },
        scope: this
      }
    });
    return option.render(config); 
  };
  
  this.render = function(config){
    var name = config.id || config.name;
    this.name = name;

    this.el = document.createElement("ul");
    this.el.setAttribute("class", "list-group");
    
    if(name) { 
      this.el.setAttribute("id", name);
      this.el.setAttribute("name", name);
    }

    this.options = Object.keys(config.options).map(function(key){
      var conf = { 
        key: key, 
        value: config.options[key]
      };
      return this.createOption(conf);
    }, this);
    
    this.options.sort(this.sorter)
                .map(function(option){ return option.el; })
                .forEach(this.el.appendChild, this.el);
          
    return this;
  };
  
};

Biohacking.Fields.Text = function() {
  Biohacking.Fields.Field.apply(this, arguments);
  
  this.el = document.createElement("input");
  
  var mandatory = function(event) { 
    this.value = event.target.value;
  };
  
  this.el.addEventListener("keyup", mandatory.bind(this) );
  this.el.addEventListener("change", mandatory.bind(this) );
  
  this.render = function(field) {
        
    var name = field.id || field.name;
    this.name = name;
    
    if(name) { 
      this.el.setAttribute("id", name);
      this.el.setAttribute("name", name);
    }
    
    this.el.setAttribute("class", "form-control field");
    this.el.setAttribute("placeholder", "Enter text");
    this.el.setAttribute("mandatory", !!field.mandatory );
    return this;
  };
  
};


Biohacking.Fields.Display = function() {
  Biohacking.Fields.Field.apply(this, arguments);
  
  this.el = document.createElement("span");
  
  this.setValue = function(value){
    this.el.textContent = value;
    this.value = value;
  }
  
  this.render = function(config) {
        
    var name = config.id || config.name;
    this.name = name;
    
    if(name) { 
      this.el.setAttribute("id", name);
      this.el.setAttribute("name", name);
    }
    
    this.el.textContent = config.value;
    return this;
  };
  
};

Biohacking.Fields.Button = function() {
  
  Biohacking.Fields.Text.apply(this, arguments);
  
  this._oldRender = this.render;
  
  this.render = function(field) {
    this._oldRender(field);
    this.el.setAttribute("type", "button");
    this.el.setAttribute("class", "form-control");
    this.el.setAttribute("value", field.title || field.name);
    this.el.addEventListener('click', function(){
      this.fireEvent('click');
    }.bind(this));  
    
    this.register(field.events);
    return this;
  };
  
};


Biohacking.Fields.Date = function() {
  Biohacking.Fields.Text.apply(this, arguments);
  
  this._oldRender = this.render;
  
  this.setValue = function(value){
    this._oldEl.value = value;
    this.value = value;
  }
  
  this.render = function(field) {
    this._oldRender(field);
    
    this._oldEl = this.el;
    this._oldEl.value = moment().format();
    this._oldEl.dispatchEvent(new Event("change"));
    
    this.el = document.createElement("div");
    this.el.setAttribute("class", "input-group date");
    
    var glyphicon = document.createElement("span");
    glyphicon.setAttribute("class", "glyphicon glyphicon-calendar");
    var addon = document.createElement("span");
    addon.setAttribute("class", "input-group-addon");
    addon.appendChild( glyphicon );
    
    this.el.appendChild( this._oldEl );
    this.el.appendChild( addon );

    return this;
  };
};

Biohacking.Section = function() {
  this.fields = [];
  this.el = document.createElement("div");
  this.el.setAttribute("class", "section");
  
  this.createField = function(field) {
      var item = Biohacking.Fields[field.type] || Biohacking.Fields.Field;
      return (new item).render(field);
  };
  
  this.render = function(section) {
    this.el.setAttribute('name', section.name);
    this.el.setAttribute('id', section.name);
    this.fields = section.fields.map(this.createField, this);
    this.fields.forEach(function(field){
      if(section.hidden) {
        field.toggle();
      }

      this.el.appendChild( field.el );
    }, this);
    return this;
  };
  
};

Biohacking.FormBuilder = function(){

  this.layout;
  this.sections = [];
  this.el = document.createElement("form");
  this.afterRender = function(){ };

  this.createSection = function(section){
      var sectionComponent = new Biohacking.Section;
      sectionComponent.render(section);
      return sectionComponent;
  };
  
  this.findField = function(fieldName) {
    
    return this.sections.reduce(function(founded, section){
      
      section.fields.forEach(function(field){      
        if(fieldName === field.name) 
          founded = field;
      });
      return founded;
    }, null);
    
  };

  this.toJSON = function(){
    var json = {};
    this.sections.forEach(function(section){
      section.fields.forEach(function(field){
        if(field.value) json[field.name] = field.value;
      });
    });
    
    return json;
  };


  this.toggleFields = function() {
    return this.sections.forEach(function(section){      
        section.fields.forEach(function(field){      
          field.show();      
        });      
    }, null);
  };
  
  this.render = function(layout){
    if(layout) this.layout = layout;
    this.sections = this.layout.sections.map( this.createSection, this );
    var sections = document.createDocumentFragment();
    this.sections.map(function(section){ return section.el; })
                 .forEach( sections.appendChild, sections );
    this.el.appendChild( sections );
    this.afterRender();
    return this;
  };
  
};

Biohacking.EditFormBuilder = function(obj){
  this._oldRender = this.render;
  
  this.render = function(layout){
    this._oldRender(layout);
    
    this.el.setAttribute('class', 'form');
    return this;
  }
  
  this.updateFields = function(obj) {
    return this.sections.forEach(function(section){      
        section.fields.forEach(function(field){      
          field.setValue(obj[field.name]);
        });      
    }, null);
  };
  
  this.layout = { 
    sections: [
      {
       name:'form',
       hidden:true,
       fields: [{
         name : "description",
         "class": "display",
         type: 'Display',
       },{
          name: 'date',
          mandatory: true,
          type: 'Date'
        },{
          name: 'tags',
          placeholder: "Enter tags to edit",
          type: 'Text'
       },{
            name: 'Delete',
            type: 'Button',
             events:{
  		       click:{
    		       handler: function(evt){    
    		         var lv = formBuilder.findField('ListView');
                 lv.removeRow();
              },
              scope: this
  		      }
           }
         },{
           name: 'Done',
           type: 'Button',
           events:{
  		       click:{
    		       handler: function(evt){
    		         var lv = formBuilder.findField('ListView');
                 lv.updateRow(this.toJSON());
              },
              scope: this
  		      }
           },
         }]
      }
   ]
  }
}

Biohacking.EditFormBuilder.prototype = new Biohacking.FormBuilder;

Biohacking.TrackFormBuilder = function() {
  
  this.selectRow = function(evt){
    var lv = this.findField('ListView');
    editForm.updateFields(lv.selectedRow)
    editForm.toggleFields();
  }.bind(this);
  
  var listView = { 
    name: 'ListView',
    type: 'ListView',
    dataSource : DATA_SOURCE,
    dataConfig : [ {
        class : 'kind-info',
        fields: {
          'description' : {
            class: 'kind',
            events: {
              click : {
                handler : this.selectRow
              }
            },
          },
          'date' : {
            class: 'date',
            format : function(value){return moment(value).format('DD/MM/YYYY HH:mm');},
             events: {
              click : {
                handler : this.selectRow
              }
            },
          } 
        }
      },
      {
        class : 'tags',
        fields: {
          'tags' : {
            events: {
              click : {
                handler : this.selectRow
              }
            },
          },
            
        }
      }
    ]
  }
  
  this.layout = {
     sections:[
       {
         name: 'formEdit',
         fields:[]
       },
       {
          fields :[
            listView
          ]
       }
     ]
  };
  
};




var DATA_SOURCE = [
  {
    description : 'WORKOUT',
    date : '2015-09-28 06:00',
    tags: '#calisthenics #press #pushup'
  },
  
  {
    description : 'EAT',
    date : '2015-09-28 09:00',
    tags: '#coffee #bulletproof #coconutoil #mct #butter'
  },
  
  {
    description : 'EAT',
    date : '2015-09-28 12:00',
    tags: '#meat #pork #500g'
  },
  
  {
    description : 'SLEEP',
    date : '2015-09-28 00:00',
    tags: '#nap'
  }
];
