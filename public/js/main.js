


function formatDate(dateString) {
  if (!dateString) return 'N/A';
  
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  return new Date(dateString).toLocaleDateString(undefined, options);
}

function formatCurrency(amount) {
  if (amount === undefined || amount === null) return 'Free';
  
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount).replace('₨', 'Rs.');
}

function showAlert(message, type = 'danger', container = '#alertContainer', timeout = 5000) {
  const alertContainer = document.querySelector(container);
  if (!alertContainer) return;
  
  const alertElement = document.createElement('div');
  alertElement.className = `alert alert-${type} alert-dismissible fade show`;
  alertElement.role = 'alert';
  
  alertElement.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;
  
  alertContainer.appendChild(alertElement);
  
  // Auto-dismiss after timeout
  if (timeout > 0) {
    setTimeout(() => {
      alertElement.classList.remove('show');
      setTimeout(() => {
        alertContainer.removeChild(alertElement);
      }, 150);
    }, timeout);
  }
}

function getEventBadgeClass(category) {
  switch (category) {
    case 'Tech Events':
      return 'badge-tech';
    case 'Business Competitions':
      return 'badge-business';
    case 'Gaming Tournaments':
      return 'badge-gaming';
    case 'General Events':
      return 'badge-general';
    default:
      return 'bg-secondary';
  }
}
document.addEventListener('DOMContentLoaded', function() {
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(function(tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });
  
  const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
  popoverTriggerList.map(function(popoverTriggerEl) {
    return new bootstrap.Popover(popoverTriggerEl);
  });
});
