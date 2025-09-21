/**
 * Contact Form Handler with EmailJS Integration
 * Provides functional contact form that sends emails without backend
 */

(function() {
  'use strict';

  // EmailJS configuration - you'll need to set up EmailJS account
  const EMAILJS_CONFIG = {
    serviceId: 'service_igor_portfolio', // TODO: Replace with your EmailJS service ID
    templateId: 'template_contact_form', // TODO: Replace with your EmailJS template ID
    publicKey: 'YOUR_EMAILJS_PUBLIC_KEY' // TODO: Replace with your EmailJS public key
  };

  // Initialize when DOM is ready
  document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contact-form');
    const statusEl = document.querySelector('.cf-status');
    
    if (!contactForm) return;

    // Initialize EmailJS (if API key is configured)
    if (EMAILJS_CONFIG.publicKey !== 'YOUR_EMAILJS_PUBLIC_KEY') {
      initializeEmailJS();
    }

    // Attach form handler
    contactForm.addEventListener('submit', handleFormSubmit);
    
    // Add real-time validation
    addFormValidation();
  });

  function initializeEmailJS() {
    // Load EmailJS library dynamically
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
    script.onload = function() {
      if (window.emailjs) {
        emailjs.init(EMAILJS_CONFIG.publicKey);
      }
    };
    document.head.appendChild(script);
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const statusEl = document.querySelector('.cf-status');
    const submitBtn = document.getElementById('cf-send');
    
    // Get form data
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      subject: formData.get('subject') || 'Contact from Portfolio',
      message: formData.get('message')
    };

    // Basic validation
    if (!data.name || !data.email || !data.message) {
      showStatus('Please fill in all required fields.', 'error');
      return;
    }

    if (!isValidEmail(data.email)) {
      showStatus('Please enter a valid email address.', 'error');
      return;
    }

    // Show loading state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    showStatus('Sending your message...', 'info');

    // Try EmailJS first, fallback to mailto
    if (window.emailjs && EMAILJS_CONFIG.publicKey !== 'YOUR_EMAILJS_PUBLIC_KEY') {
      sendViaEmailJS(data, form, submitBtn);
    } else {
      // Fallback: mailto link and local storage
      sendViaMailto(data, form, submitBtn);
    }
  }

  function sendViaEmailJS(data, form, submitBtn) {
    const templateParams = {
      from_name: data.name,
      from_email: data.email,
      subject: data.subject,
      message: data.message,
      to_email: 'szunio2004@gmail.com' // Your actual email
    };

    emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templateId,
      templateParams
    ).then(
      function(response) {
        showStatus('Message sent successfully! I\'ll get back to you soon.', 'success');
        form.reset();
        logMessage(data); // Store locally as backup
      },
      function(error) {
        console.error('EmailJS Error:', error);
        showStatus('Failed to send message. Please try the direct email option.', 'error');
        // Fallback to mailto
        sendViaMailto(data, form, submitBtn);
      }
    ).finally(function() {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send';
    });
  }

  function sendViaMailto(data, form, submitBtn) {
    // Store message locally for reference
    logMessage(data);
    
    // Create mailto link
    const subject = encodeURIComponent(data.subject);
    const body = encodeURIComponent(
      `Name: ${data.name}\n` +
      `Email: ${data.email}\n\n` +
      `Message:\n${data.message}`
    );
    const mailtoLink = `mailto:szunio2004@gmail.com?subject=${subject}&body=${body}`;
    
    // Open email client
    window.location.href = mailtoLink;
    
    showStatus('Opening your email client... Message has been saved locally.', 'info');
    
    // Reset form after short delay
    setTimeout(() => {
      form.reset();
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send';
      showStatus('Message prepared! Please send it from your email client.', 'success');
    }, 2000);
  }

  function logMessage(data) {
    // Store message locally for backup/reference
    try {
      const messages = JSON.parse(localStorage.getItem('contact_messages') || '[]');
      messages.push({
        ...data,
        timestamp: new Date().toISOString(),
        id: Date.now()
      });
      
      // Keep only last 50 messages
      if (messages.length > 50) {
        messages.splice(0, messages.length - 50);
      }
      
      localStorage.setItem('contact_messages', JSON.stringify(messages));
    } catch (e) {
      console.warn('Could not save message locally:', e);
    }
  }

  function addFormValidation() {
    const nameInput = document.getElementById('cf-name');
    const emailInput = document.getElementById('cf-email');
    const messageInput = document.getElementById('cf-message');

    if (nameInput) {
      nameInput.addEventListener('blur', function() {
        validateField(this, this.value.trim().length >= 2, 'Name must be at least 2 characters');
      });
    }

    if (emailInput) {
      emailInput.addEventListener('blur', function() {
        validateField(this, isValidEmail(this.value), 'Please enter a valid email address');
      });
    }

    if (messageInput) {
      messageInput.addEventListener('blur', function() {
        validateField(this, this.value.trim().length >= 10, 'Message must be at least 10 characters');
      });
    }
  }

  function validateField(field, isValid, errorMessage) {
    const existingError = field.parentNode.querySelector('.field-error');
    
    if (existingError) {
      existingError.remove();
    }

    if (!isValid && field.value.trim()) {
      field.classList.add('error');
      const errorEl = document.createElement('div');
      errorEl.className = 'field-error';
      errorEl.textContent = errorMessage;
      errorEl.style.cssText = 'color: #ff4757; font-size: 0.85rem; margin-top: 0.25rem;';
      field.parentNode.appendChild(errorEl);
    } else {
      field.classList.remove('error');
    }
  }

  function showStatus(message, type = 'info') {
    const statusEl = document.querySelector('.cf-status');
    if (!statusEl) return;

    statusEl.textContent = message;
    statusEl.className = `cf-status cf-status-${type}`;
    
    // Auto-hide success/error messages after 5 seconds
    if (type === 'success' || type === 'error') {
      setTimeout(() => {
        statusEl.textContent = '';
        statusEl.className = 'cf-status';
      }, 5000);
    }
  }

  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Utility function to get stored messages (for debugging)
  window.getContactMessages = function() {
    try {
      return JSON.parse(localStorage.getItem('contact_messages') || '[]');
    } catch (e) {
      return [];
    }
  };

})();
