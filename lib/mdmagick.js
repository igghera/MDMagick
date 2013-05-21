/*
# MDMagick

* url: https://github.com/fguillen/MDMagick
* author: http://fernandoguillen.info
* demo page: http://fguillen.github.com/MDMagick/

## Versión

  v0.0.3

## Documentation

* README: https://github.com/fguillen/MDMagick/blob/master/README.md
*/

var MDM_VERSION = "0.0.4";

function MDM(inputElement) {

	this.inputElement = inputElement;
	this.controls = [
		{icon: 'B', action: 'bold'},
		{icon: 'I', action: 'italic'},
		{icon: 'a', action: 'link'},
		{icon: 'T', action: 'title'},
		{icon: 'l', action: 'list'}
	];

	this.initialize = function() {
  		this.controlsElement = MDM.Utils.appendControls(inputElement, this.controls);
  		this.previewElement  = MDM.Utils.appendPreview(inputElement);

  		this.activatePreview(this.inputElement);
  		this.activateControls(this.controlsElement);
  		this.activateInput(this.inputElement, this.controlsElement, this.previewElement);

  		this.updatePreview();
  	};

  	this.click_on_control = false;

  	this.activateControls = function(controlsElement) {
  		var _self = this;
  		this.controls.forEach(function(controlObj) {

  			var actionName = controlObj.action;

  			$(controlsElement).find(".mdm-" + actionName).click(function(event) {
  			 	_self.action(actionName, event)
  			});
  		});
  	};

  	this.activatePreview = function(inputElement) {
  		$(inputElement).keyup($.proxy(this.updatePreview, this));
  	};

  	this.activateInput = function(inputElement, controlsElement, previewElement) {
  		var _self = this;

  		$(controlsElement).mousedown(function() {
  			_self.click_on_control = true;
  		});

  		$(inputElement).focus(function() {
  			_self.click_on_control = false;
  			$(controlsElement).addClass("focus");
  			$(previewElement).addClass("focus");
  			$(controlsElement).removeClass("blur");
  			$(previewElement).removeClass("blur");
  		});

  		$(inputElement).blur(function() {
  			if (!_self.click_on_control) {
  				$(controlsElement).removeClass("focus");
  				$(previewElement).removeClass("focus");
  				$(controlsElement).addClass("blur");
  				$(previewElement).addClass("blur");
  			}
  		});
  	};

  	this.updatePreview = function() {
  		var converter = new Attacklab.showdown.converter();
  		$(this.previewElement).html(
			converter.makeHtml($(this.inputElement).val().replace(/</g,'&lt;').replace(/>/g,'&gt;'))
		);
  	};

  	this.action = function(actionName, event) {
  		event.preventDefault();
  		MDM.Actions[ actionName ](this.inputElement);
  		this.updatePreview();
  	};

  	this.initialize();
}


/*
The logic of each of the control buttons
*/
MDM.Actions = {
  	bold: function(inputElement) {

  		var selection = $(inputElement).getSelection();

  		if(selection.length === 0) {
  			MDM.Utils.selectWholeLines(inputElement);
  			selection = $(inputElement).getSelection();
  		}

  		$(inputElement).replaceSelection("**" + selection.text + "**");
  	},

  	italic: function(inputElement) {
  		var selection = $(inputElement).getSelection();

  		if(selection.length === 0) {
  			MDM.Utils.selectWholeLines(inputElement);
  			selection = $(inputElement).getSelection();
  		}

  		$(inputElement).replaceSelection("_" + selection.text + "_");
  	},

  	link: function(inputElement) {
  		var link = prompt("Link to URL", "http://");
  		var selection = $(inputElement).getSelection();

  		if(selection.length === 0) {
  			MDM.Utils.selectWholeLines(inputElement);
  			selection = $(inputElement).getSelection();
  		}

  		if(link)
  			$(inputElement).replaceSelection("[" + selection.text + "](" + link + ")");
  	},

  	title: function(inputElement) {
  		MDM.Utils.selectWholeLines(inputElement);
  		var selection = $(inputElement).getSelection();
  		var hash = (selection.text.charAt(0) == "#") ? "#" : "# ";
  		$(inputElement).replaceSelection(hash + selection.text);
  	},

  	list: function(inputElement) {
  		MDM.Utils.selectWholeLines(inputElement);
  		var selection = $(inputElement).getSelection();
  		var text = selection.text;
  		var result = "";
  		var lines = text.split("\n");
  		for(var i = 0; i < lines.length; i++) {
  			var line = $.trim(lines[i]);
  			if(line.length > 0) result += "- " + line + "\n";
  		}

  		$(inputElement).replaceSelection(result);
  	}
}

MDM.Utils = {
  	appendControls: function(inputElement, controls) {
  		var element = $(MDM.Utils.controlsTemplate(controls));
  		$(inputElement).before(element);

  		return element;
  	},

  	appendPreview: function(inputElement) {
  		var element = $(MDM.Utils.previewTemplate());
  		element.css("width", $(inputElement).css("width"));
		// element.css("padding", $(inputElement).css("padding"));
		element.css("font-size", $(inputElement).css("font-size"));
		$(inputElement).after(element);

		return element;
	},

	selectWholeLines: function(inputElement) {
		var content = $(inputElement).val();
		var selection = $(inputElement).getSelection();
		var iniPosition = (selection.start > 0) ? (selection.start - 1) : 0;
		var endPosition = selection.end;

		// going back until a "\n"
		while(content[iniPosition] != "\n" && iniPosition >= 0) {
			iniPosition--;
		}

		while(content[endPosition] != "\n" && endPosition <= content.length) {
			endPosition++;
		}

		$(inputElement).setSelection(iniPosition + 1, endPosition);
	},

	controlsTemplate: function(controls) {
		var template = "<div class=\"mdm-buttons mdm-control\"><ul>";

		for(var i = 0, len = controls.length; i < len; i++) {
			var action = controls[i]['action'];
			var icon = controls[i]['icon'];
			console.log(action +': '+ icon);

			template += '<li class="mdm-'+ action +'"><a title="'+ action +'" class="mdm-icon-'+ action +'" href="#mdm-'+ action +'"><span>'+ icon +'</span></a></li>';
		}

		template += "  </ul></div>";

		return template;
	},

	previewTemplate: function() {
		var template = "<div class=\"mdm-preview mdm-control\"></div>";

		return template;
	}
}

$(function() {
	jQuery.fn.mdmagick = function() {
		this.each(function(index, inputElement) {
			var mdm = new MDM(inputElement);
		});
	};

	$(".mdm-input").mdmagick();
});
