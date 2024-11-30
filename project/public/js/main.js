(function ($) {
    "use strict";
    // Spinner
    var spinner = function () {
        setTimeout(function () {
            if ($('#spinner').length > 0) {
                $('#spinner').removeClass('show');
            }
        }, 1);
    };
    spinner();
    // Initiate the wowjs
   // new WOW().init();
    // Sticky Navbar
    $(window).scroll(function () {
        if ($(this).scrollTop() > 300) {
            $('.sticky-top').css('top', '0px');
        } else {
            $('.sticky-top').css('top', '-100px');
        }
    });
  // Dropdown on mouse hover

    const $dropdown = $(".dropdown");

    const $dropdownToggle = $(".dropdown-toggle");

    const $dropdownMenu = $(".dropdown-menu");

    const showClass = "show";

    $(window).on("load resize", function () {

        if (this.matchMedia("(min-width: 992px)").matches) {

            $dropdown.hover(

                function () {

                    const $this = $(this);

                    $this.addClass(showClass);

                    $this.find($dropdownToggle).attr("aria-expanded", "true");

                    $this.find($dropdownMenu).addClass(showClass);

                },

                function () {

                    const $this = $(this);

                    $this.removeClass(showClass);

                    $this.find($dropdownToggle).attr("aria-expanded", "false");

                    $this.find($dropdownMenu).removeClass(showClass);

                }

            );

        } else {

            $dropdown.off("mouseenter mouseleave");

        }

    });
  // Back to top button

    $(window).scroll(function () {

        if ($(this).scrollTop() > 300) {

            $('.back-to-top').fadeIn('slow');

        } else {

            $('.back-to-top').fadeOut('slow');

        }

    });

    $('.back-to-top').click(function () {

        $('html, body').animate({ scrollTop: 0 }, 1500, 'easeInOutExpo');

        return false;

    });

    // Header carousel

    $(".header-carousel").owlCarousel({

        autoplay: true,

        smartSpeed: 1500,

        items: 1,

        dots: false,

        loop: true,

        nav: true,

        navText: [

            '<i class="bi bi-chevron-left"></i>',

            '<i class="bi bi-chevron-right"></i>'

        ]

    });
  // Testimonials carousel

    $(".testimonial-carousel").owlCarousel({

        autoplay: true,

        smartSpeed: 1000,

        center: true,

        margin: 24,

        dots: true,

        loop: true,

        nav: false,

        responsive: {

            0: {

                items: 1

            },

            768: {

                items: 2

            },

            992: {

                items: 3

            }

        }

    });
    
// public/js/reset-password.js
document.getElementById('resetPasswordForm').addEvent {stener('submit', async (e) => {
  e.preventDefault(); // Prevent form from submitting the traditional way

  const email = document.getElementById('email').value;
  const errorMessage = document.getElementById('errorMessage');
  const successMessage = document.getElementById('successMessage');

  // Hide any previous messages
  errorMessage.style.display = 'none';
  successMessage.style.display = 'none';

  // Basic validation (optional)
  if (!email) {
    errorMessage.style.display = 'block';
    errorMessage.innerHTML = 'Please enter your email address.';
    return;
  }

  try {
    const response = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (response.status === 200) {
      // Success: Show success message
      successMessage.style.display = 'block';
    } else {
      // Show error message if email not found
      errorMessage.style.display = 'block';
      errorMessage.innerHTML = data.error || 'Something went wrong. Please try again.';
    }
  } catch (error) {
    // Handle errors during the fetch request
    console.error('Error during reset password request:', error);
    errorMessage.style.display = 'block';
    errorMessage.innerHTML = 'An error occurred. Please try again later.';
  }
});

})(jQuery);