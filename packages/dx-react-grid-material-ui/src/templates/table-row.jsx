import React from 'react';
import PropTypes from 'prop-types';
import { TableRow as TableRowMUI } from 'material-ui';

export const TableRow = ({
  children,
  row, tableRow, tableColumn,
  ...restProps
}) => (
  <TableRowMUI
    {...restProps}
  >
    {children}
  </TableRowMUI>
);

TableRow.propTypes = {
  children: PropTypes.node,
  row: PropTypes.object,
  tableRow: PropTypes.object,
  tableColumn: PropTypes.object,
};

TableRow.defaultProps = {
  children: null,
  row: undefined,
  tableRow: undefined,
  tableColumn: undefined,
};
