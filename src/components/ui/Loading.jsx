import PropTypes from 'prop-types';
import { Loader2 } from 'lucide-react';

const Loading = ({
  size = 'md',
  fullScreen = false,
  text = 'Chargement...',
  showText = true,
  color = 'blue'
}) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const colors = {
    blue: 'text-blue-600',
    gray: 'text-gray-600',
    green: 'text-green-600',
    red: 'text-red-600'
  };

  const spinner = (
    <div className={`flex flex-col items-center justify-center ${fullScreen ? 'min-h-screen' : ''}`}
         role="status"
         aria-live="polite"
    >
      <Loader2 className={`animate-spin ${sizes[size]} ${colors[color]}`} aria-hidden="true" />
      {showText && (
        <p className={`mt-2 text-sm ${colors[color]}`}>{text}</p>
      )}
      <span className="sr-only">Chargement en cours</span>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
};

Loading.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  fullScreen: PropTypes.bool,
  text: PropTypes.string,
  showText: PropTypes.bool,
  color: PropTypes.oneOf(['blue', 'gray', 'green', 'red'])
};

Loading.defaultProps = {
  size: 'md',
  fullScreen: false,
  text: 'Chargement...',
  showText: true,
  color: 'blue'
};

export const LoadingOverlay = ({ show, ...props }) => {
  if (!show) return null;

  return (
    <div className="absolute inset-0 bg-white bg-opacity-75 z-10 flex items-center justify-center">
      <Loading {...props} />
    </div>
  );
};

LoadingOverlay.propTypes = {
  show: PropTypes.bool.isRequired,
  ...Loading.propTypes
};

export default Loading;