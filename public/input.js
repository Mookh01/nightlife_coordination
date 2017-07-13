  $(function() {

      var textToShow = "I'm Going";
      $(document).ready(function() {
          $(".going").html(textToShow);
      });

      $(".going").click(function() {
          var self = $(this);
          if (self.text() == "I'm Going") {
              self.text("NOT Going");
              self.css('background', 'red');
              var data = { 'city': this.name, 'status': this.id };
          } else {
              self.text("I'm Going");
              self.css('background', 'green');
          }
          var activeel = self[0].attributes[0].ownerDocument.activeElement.classList[3];
          var who = self[0].attributes[0].ownerDocument.head.textContent;
          var attendance = this.innerText;
          var city = this.name;
          var bar = this.id;
          var text = this.innerHTML;
          $.ajax({
              type: 'POST',
              url: '/new/attend',
              dataType: 'JSON',
              data: { 'city': this.name, 'bar': this.id, 'attendance': this.innerText },
              success: function(data) {
                  window.location = data.redirect;
              }
          });
      });
      $(".notgoing").click(function() {
          var self = $(this);
          if (self.text() == "NOT Going") {
              self.text("I'm Going");
              self.css('background', 'green');
              var data = { 'city': this.name, 'status': this.id };
          } else {
              self.text("NOT Going");
              self.css('background', 'red');
          }
      });
  });