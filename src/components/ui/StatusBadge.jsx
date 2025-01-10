import PropTypes from 'prop-types';
import { Check, X, Clock } from 'lucide-react';

const StatusBadge = ({ status }) => {
  const styles = {
    PRESENT: { bg: 'bg-green-100', text: 'text-green-800', icon: Check },
    ABSENT: { bg: 'bg-red-100', text: 'text-red-800', icon: X },
    LATE: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock }
  };

  const style = styles[status] || styles.ABSENT;
  const Icon = style.icon;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
      <Icon className="w-3 h-3 mr-1" />
      {status}
    </span>
  );
};

StatusBadge.propTypes = {
  status: PropTypes.oneOf(['PRESENT', 'ABSENT', 'LATE']).isRequired
};

export default StatusBadge;