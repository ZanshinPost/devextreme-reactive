import React from 'react';
import PropTypes from 'prop-types';

export const GroupPanelEmptyMessage = ({ getMessage, ...restProps }) => (
  <div
    style={{
      padding: '7px 0',
      marginBottom: '5px',
    }}
    {...restProps}
  >
    {getMessage('groupByColumn')}
  </div>
);

GroupPanelEmptyMessage.propTypes = {
  getMessage: PropTypes.func.isRequired,
};
