	/*********  POP FORMS  **********/
$(document).ready(function() {
	$("body").prepend('<div class="popform_shadow"></div>');

	$.prototype.popform = function(options) {
	  if (options === undefined) {
	    options = { form: $(this) };
	  } else {
	    options.form = $(this);
	  }

	  return new PopForm(options);
	}

	PopForm = function(options) {
	  var that = this;
	  this.options = options;
	  this.shadow_div = $(".popform_shadow");
	  this.form = options.form;
	  this.submit_btn = $("input[type=submit]", options.form);
	  this.cancel_btn = $("input[type=button]", options.form);
	  this.submit_url = this.form.attr("action");

	  /* callbacks */
	  this.onCancel = options.onCancel;
	  this.onSubmit = options.onSubmit;
	  this.onSuccess = options.onSuccess;
	  this.onFailure = options.onFailure;
	  this.onServerFailure = options.onServerFailure;
	  this.formatUrl = options.formatUrl;

	  /* wrap and hide form */
	  if (this.form.parent().attr("class") != "popform") {
	    this.form.wrap('<div class="popform"></div>');
    }

	  this.container = this.form.parent();

	  this.cancel_btn.click(function() {
	    that.hide();
	    if (that.onCancel !== undefined) {
	      that.onCancel(that);
	    }
	  });

	  this.submit_btn.click(function(event) {
	    //prevent submission of the form cuz we're gonna submit via ajax
	    event.preventDefault();

	    //gather all form data into an array
	    var form_data = [];
	    var form_elements = [];
	    $("input:text, input:checkbox:checked, input:radio:checked, textarea, select", that.form).each(function(index, form_element) {
	      if ($(form_element).attr("name") !== undefined) {
	        form_elements[$(form_element).attr("name")] = $(form_element).val();
	        form_data.push(escape($(form_element).attr("name")) + '=' + escape($(form_element).val()));
	      }
	    });

	    if (that.onSubmit !== undefined) {
	      var extra_params = that.onSubmit(form_elements, that);
	      if (extra_params) {
	        $.each(extra_params, function(index, value) {
	          form_data.push(value);
	        });
	      }
	    }

      if ((that.submit_url !== undefined) && (that.submit_url != "")) {
  	    $.ajax({
  	      type: 'POST',
  	      url: (that.formatUrl === undefined) ? that.submit_url : that.formatUrl(that.submit_url),
  	      data: form_data.join("&"),
  	      dataType: "json",
  	      success: function(response, textStatus, jqXHR) {
  	        if (response.result == "succeeded") {
  	          that.hide();

  	          if (that.onSuccess !== undefined) {
  	            that.onSuccess(response, that);
  	          }
  	        } else {
  	          if (that.onFailure !== undefined) {
  	            that.onFailure(response, that);
  	          }
  	        }
  	      },
  	      error: function(response, textStatus, jqXHR) {
  	        if (that.onServerFailure !== undefined) {
  	          that.onServerFailure(response, that);
  	        }
  	      }
  	    });
      }
	  });
	}

	PopForm.prototype = {
	  show: function() {
	    this.shadow_div.css("height", $(document).height());
	    this.shadow_div.show();
	    this.form.show();
	    this.container.show();
	    this.container.css("position", "absolute");
	    this.container.css("top", (($(window).height() / 2) - (this.container.height() / 2)) + $(window).scrollTop());
	    this.container.css("left", ($(window).width() / 2) - (this.container.width() / 2));
	  },

	  hide: function() {
	    this.container.hide();
	    this.shadow_div.hide();
	  },

	  clear: function() {
	    $("input:text, input:checkbox:checked, textarea, select", this.form).each(function(index, form_element) {
	      $(form_element).val("");
	    });
	  }
	}
});