import PropTypes from 'prop-types';

export const Card = ({ className = '', children = null, ...props }) => (
 <div 
   className={`bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 ${className}`} 
   {...props}
 >
   {children}
 </div>
);

Card.propTypes = {
 className: PropTypes.string,
 children: PropTypes.node
};

export const CardHeader = ({ className = '', children = null, ...props }) => (
 <div 
   className={`px-6 py-4 border-b border-gray-200 dark:border-gray-700 ${className}`} 
   {...props}
 >
   {children}
 </div>
);

CardHeader.propTypes = {
 className: PropTypes.string,
 children: PropTypes.node
};

export const CardTitle = ({ className = '', children = null, ...props }) => (
 <h3 
   className={`text-xl font-semibold text-gray-900 dark:text-gray-100 ${className}`} 
   {...props}
 >
   {children}
 </h3>
);

CardTitle.propTypes = {
 className: PropTypes.string,
 children: PropTypes.node
};

export const CardContent = ({ className = '', children = null, ...props }) => (
 <div 
   className={`px-6 py-4 ${className}`} 
   {...props}
 >
   {children}
 </div>
);

CardContent.propTypes = {
 className: PropTypes.string, 
 children: PropTypes.node
};

export const CardFooter = ({ className = '', children = null, ...props }) => (
 <div 
   className={`px-6 py-4 border-t border-gray-200 dark:border-gray-700 ${className}`}
   {...props}
 >
   {children}
 </div>
);

CardFooter.propTypes = {
 className: PropTypes.string,
 children: PropTypes.node
};

export default Card;