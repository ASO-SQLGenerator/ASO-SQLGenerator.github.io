(function (Handsontable) {
  "use strict";
  /**
   * Handsontable RemoveRow plugin. See `demo/buttons.html` for example usage
   * This plugin is not a part of the Handsontable build (to use it, you must load it after loading Handsontable)
   * See `test/removeRowSpec.js` for tests
   */
  function removeRow() {

    var eventManager = Handsontable.eventManager(this);

    function bindMouseEvents() {
      var instance = this;

      eventManager.addEventListener(instance.rootElement, 'mouseover', function (e) {
        if(checkRowHeader(e.target)) {
          var element = getElementFromTargetElement(e.target);
          if (element) {
            var btn = getButton(element);
            if (btn) {
              btn.style.display = 'block';
            }
          }
        }
      });

      eventManager.addEventListener(instance.rootElement, 'mouseout', function (e) {
        if(checkRowHeader(e.target)) {
          var element = getElementFromTargetElement(e.target);
          if (element) {
            var btn = getButton(element);
            if (btn) {
              btn.style.display = 'none';
            }
          }
        }
      });

//      instance.rootElement.on('mouseover.removeRow', 'tbody th, tbody td', function () {
//        getButton(this).show();
//      });
//
//      instance.rootElement.on('mouseout.removeRow', 'tbody th, tbody td', function () {
//        getButton(this).hide();
//      });
    }

    var getElementFromTargetElement = function (element) {
      if (element.tagName != 'TABLE') {
        if (element.tagName == 'TH' || element.tagName == 'TD') {
          return element;
        } else {
          return getElementFromTargetElement(element.parentNode);
        }
      }
      return null;
    };

    var checkRowHeader = function (element) {
      if (element.tagName != 'BODY') {
        if (element.parentNode.tagName == 'TBODY') {
          return true;
        } else {
          element = element.parentNode;
          return checkRowHeader(element);
        }
      }
      return false;
    };

    function unbindMouseEvents() {
      eventManager.clear();
    }

    function getButton(td) {
      var btn = td.querySelector('.btn');

      if (!btn) {
        var parent = td.parentNode.querySelector('th.htRemoveRow');

        if (parent) {
          btn = parent.querySelector('.btn');
        }
      }

      return btn;
    }

    this.init = function () {
      var instance = this;
      var pluginEnabled = !!(instance.getSettings().removeRowPlugin);

      if (pluginEnabled) {
        bindMouseEvents.call(this);
        Handsontable.Dom.addClass(instance.rootElement, 'htRemoveRow');
      } else {
        unbindMouseEvents.call(this);
        Handsontable.Dom.removeClass(instance.rootElement, 'htRemoveRow');
      }
    };

    this.beforeInitWalkontable = function (walkontableConfig) {
      var instance = this;

      /**
       * rowHeaders is a function, so to alter the actual value we need to alter the result returned by this function
       */
      var baseRowHeaders = walkontableConfig.rowHeaders;
      walkontableConfig.rowHeaders = function () {

        var pluginEnabled = !!(instance.getSettings().removeRowPlugin);

        var newRowHeader = function (row, elem) {
          var child
            , div;

          while (child = elem.lastChild) {
            elem.removeChild(child);
          }
          elem.className = 'htNoFrame htRemoveRow';
          if (row > -1) {
            div = document.createElement('div');
            div.className = 'btn';
            div.appendChild(document.createTextNode('x'));
            elem.appendChild(div);

            eventManager.addEventListener(div, 'mouseup', function () {
								var parentnode = this.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;
								var tablediv = parentnode.id;
								var key = tablediv.replace(/dtable/g,"");
								var tabledata = localStorage.getItem(key);
								//alert(tabledata);
								
								//テーブルスペース条件のための列名取得
								var aaa = eval('hot'+key+'.getColHeader(0);');
	
								tabledata = JSON.parse(tabledata);
								var stoc = tabledata.data[row][aaa];
								console.log(stoc);
								tabledata.data.splice(row,1);
								var deletedata = tabledata;
								deletedata = JSON.stringify(deletedata);
								//deletedata = JSON.parse(deletedata);
								localStorage.setItem(key,deletedata);
								console.log(deletedata.data);
								//alert(deletedata);
								//alert(tabledata.table);
								
								/*stocの値が数値のみのとき、文字のときでstocに""をつけるかどうかの処理が必要
								if(文字型の場合){
									stoc = JSON.stringify(stoc);
								}
								*/
								var sql = "DELETE FROM " + tabledata.table + " WHERE " + aaa + " = " + stoc + ";";
								sessionStorage.setItem("dropState",sql);
								if (sql) {
									$('#dmain_sqlarea').val(sql);
								}
								//var bbb = eval('hot'+key+'.getDataAtRow(row);');
								instance.alter('remove_row', row);
            });
          }
        };
        return pluginEnabled ? Array.prototype.concat.call([], newRowHeader, baseRowHeaders()) : baseRowHeaders();
      };
    }
  }

  var htRemoveRow = new removeRow();

  Handsontable.hooks.add('beforeInitWalkontable', function (walkontableConfig) {
    htRemoveRow.beforeInitWalkontable.call(this, walkontableConfig);
  });

  Handsontable.hooks.add('beforeInit', function () {
    htRemoveRow.init.call(this)
  });

  Handsontable.hooks.add('afterUpdateSettings', function () {
    htRemoveRow.init.call(this)
  });

})(Handsontable);
