import PropTypes from 'prop-types';
import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react';

const Alert = ({
  type = 'info',
  title,
  message,
  onClose,
  action,
  showIcon = true,
  className = ''
}) => {
  const types = {
    info: {
      icon: Info,
      styles: 'bg-blue-50 text-blue-800 border-blue-200',
      iconColor: 'text-blue-500'
    },
    success: {
      icon: CheckCircle,
      styles: 'bg-green-50 text-green-800 border-green-200',
      iconColor: 'text-green-500'
    },
    warning: {
      icon: AlertCircle,
      styles: 'bg-yellow-50 text-yellow-800 border-yellow-200',
      iconColor: 'text-yellow-500'
    },
    error: {
      icon: XCircle,
      styles: 'bg-red-50 text-red-800 border-red-200',
      iconColor: 'text-red-500'
    }
  };

  const { icon: Icon, styles, iconColor } = types[type] || types.info;

  return (
    <div 
      className={`flex p-4 border rounded-lg ${styles} ${className}`}
      role="alert"
      aria-live="polite"
    >
      {showIcon && (
        <div className={`flex-shrink-0 ${iconColor}`}>
          <Icon className="w-5 h-5" aria-hidden="true" />
        </div>
      )}
      <div className="ml-3 flex-1">
        {title && (
          <h3 className="text-sm font-medium">{title}</h3>
        )}
        {message && (
          <div className="text-sm mt-1">{message}</div>
        )}
        {action && (
          <div className="mt-3">
            {action}
          </div>
        )}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className={`flex-shrink-0 ml-3 ${iconColor} hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${type}-500`}
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

Alert.propTypes = {
  type: PropTypes.oneOf(['info', 'success', 'warning', 'error']),
  title: PropTypes.string,
  message: PropTypes.node,
  onClose: PropTypes.func,
  action: PropTypes.node,
  showIcon: PropTypes.bool,
  className: PropTypes.string
};

export default Alert;