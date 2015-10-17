Biohacking.Fields.ListView = function(){
  Biohacking.Fields.Field.apply(this, arguments);
  
  this.el = document.createElement("div");
  this.el.setAttribute('class', 'main');
  
  this.createRow = function(obj){
    var row = new Biohacking.Fields.ListView.Row;
    row.dataRow = obj;
    row.register({
      getDataRow: {
        handler: function(row) {
          this.selectedRow = row;
          this.deselectAll(row);
        },
        scope: this,
      },
      changeRow: {
        handler: function(row) {
          // row.fireEvent('changeRow');
        },
        scope: this
      }
    });
    return row.render(obj);
  }
  
  this.getRow = function(){
    return this.rowList.filter(function(row){
         return row.dataRow == this.selectedRow.dataRow;
    }.bind(this))[0];
  }
  
  this.removeRow = function(){
    this.rowList = this.rowList.filter(function(row){
      var isRemove = this.selectedRow.dataRow == row.dataRow;
      if(isRemove){
        this.el.removeChild(row.el);
      }
      return !isRemove;
    }.bind(this));
  }
  
  // this.updateRow = function(json){
  //   var changed = false;
  //   Object.keys(json).forEach(function(key){
  //     if(this.selectedRow.dataRow[key] != json[key]){
  //       this.selectedRow.dataRow[key] = json[key];
  //       debugger;
  //       changed = true;
  //     }
  //   }.bind(this));
    
  //   if(changed) this.getRow().fireEvent('changeRow'); 
  // }
  
  this.updateRow = function(json){
    this.rowList.forEach(function(row){
      this.selectedRow.updateDataGroup(json);
    }.bind(this)); 
  }
  
  this.deselectAll = function(r) {
    this.rowList.forEach(function(row) {
      if(row !== r) row.deselect();
    });
  };
  
  this.render = function(config){
    this.name = config.name;
    this.dataConfig = config.dataConfig;
    this.dataSource = config.dataSource;
    
    this.rowList = []; 
    this.dataSource.forEach(function(obj){
      obj.config = this.dataConfig;
      this.rowList.push(this.createRow(obj));
    }, this);
    
    
    this.rowList.map(function(row){ return row.el})
                    .forEach(this.el.appendChild, this.el);
    
    return this;
    
  }
  
}

Biohacking.Fields.ListView.Row = function(){
  Biohacking.Fields.Field.apply(this, arguments);
  
  
  this.el = document.createElement("div");
  this.el.setAttribute('class', 'row');
  
  this.deselect = function() {
    this.el.setAttribute("class", "row");
  };
  
  this.select = function() {
    this.el.setAttribute("class", "row selected");
  }
  
  this.updateDataGroup = function(json){
    this.dataGroupList.forEach(function(dataGroup){
      dataGroup.updateData(json);
    })  
    
  }
  
  this.createDataGroup = function(obj, groupConfig){
    var dataGroup = new Biohacking.Fields.ListView.DataGroup;
     dataGroup.register({
      getDataRow: {
        handler: function(e) {
          this.fireEvent("getDataRow");
          this.select();
        },
        scope: this
      },
      changeDataGroup: {
        handler: function(dataGroup) {
          dataGroup.fireEvent('changeRow');
        },
        scope: this
      }
    });
    return dataGroup.render(obj, groupConfig);
  }
  
  this.render = function(obj){
    
    this.dataGroupList =[];
    obj.config.forEach(
      function(groupConfig){
         this.dataGroupList.push(this.createDataGroup(obj, groupConfig));
      }, this
    )
    
    this.dataGroupList.map(function(dataGroup){ return dataGroup.el})
                    .forEach(this.el.appendChild, this.el);
    
    return this;
  }
}

Biohacking.Fields.ListView.DataGroup = function(){
  Biohacking.Fields.Field.apply(this, arguments);
  
  this.el = document.createElement("div");
  
  this.createData = function(objField){
    var data = new Biohacking.Fields.ListView.Data;
    data.register({
      getDataRow: {
        handler: function(e) {
          this.fireEvent("getDataRow");
        },
        scope: this
      },
      changeData: {
        handler: function(data) {
          data.fireEvent('changeDataGroup');
        },
        scope: this
      }
    });
    return data.render(objField);
  }
  
  this.updateData = function(json){
    this.dataList.forEach(function(data){
      if(data.el.id)
        data.setValue(json[data.el.id]);
    })  
    
  }
  
  this.render = function(obj, config){
      
    this.el.setAttribute('class', config.class);
    
    this.dataList = Object.keys(config.fields).map(
      function(keyData){
        
        var objConfig = { 
          name: keyData,
          value: obj[keyData],
          config: config.fields[keyData] //TODO:fazer verificação quando nao existir data?
        };
        
        return this.createData(objConfig);
      }, this)
      
      //TODO:
      this.dataList
              .map(function(data){ return data.el})
              .forEach(this.el.appendChild, this.el);
          
    
    return this;
  }
} 
 
Biohacking.Fields.ListView.Data = function(){
  Biohacking.Fields.Field.apply(this, arguments);
  
  this.el = document.createElement("div");
  this.link = document.createElement("a");
  
  this.setValue =function(value){
    this.link.innerHTML = value;
  }
  
  this.mandatory = function(event){
    this.value = event.target.value;
  }
  
  this.render = function(objConfig){
    
    var config = objConfig.config;
    var value = config.format ? config.format(objConfig.value) : objConfig.value;
    this.el.setAttribute('id', objConfig.name);
    
    this.link.innerHTML = value;
    this.link.addEventListener('click', function(e){
      e.preventDefault();
      this.fireEvent('getDataRow');
      this.fireEvent('click')
    }.bind(this));
    
    this.el.setAttribute('class', config.class);
    this.el.appendChild(this.link);
    
    this.register(config.events);
    
    return this;
  }
  
}