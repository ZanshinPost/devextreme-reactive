import React from 'react';
import PropTypes from 'prop-types';
import {
  Getter,
  PluginContainer,
  Template,
  TemplatePlaceholder,
} from '@devexpress/dx-react-core';
import {
  TABLE_DATA_TYPE,
  TABLE_REORDERING_TYPE,
  orderedColumns,
  changeColumnOrder,
  getTableTargetColumnIndex,
  tableHeaderRowsWithReordering,
  draftOrder as draftOrderComputed,
} from '@devexpress/dx-grid-core';

const pluginDependencies = [
  { pluginName: 'Table' },
];

const tableHeaderRowsComputed = ({ tableHeaderRows }) =>
  tableHeaderRowsWithReordering(tableHeaderRows);

export class TableColumnReordering extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      order: props.defaultOrder || props.order,
      sourceColumnIndex: -1,
      targetColumnIndex: -1,
    };

    this.onOver = this.handleOver.bind(this);
    this.onLeave = this.handleLeave.bind(this);
    this.onDrop = this.handleDrop.bind(this);
  }
  getState() {
    const { state } = this;
    const { order = state.order } = this.props;
    return { ...state, order };
  }
  getDraftOrder() {
    const { order, sourceColumnIndex, targetColumnIndex } = this.getState();
    return draftOrderComputed(order, sourceColumnIndex, targetColumnIndex);
  }
  getAvailableColumns() {
    return this.getDraftOrder()
      .filter(columnName => !!this.cellDimensionGetters[columnName]);
  }
  getCellDimensions() {
    return this.getAvailableColumns()
      .map(columnName => this.cellDimensionGetters[columnName]());
  }
  storeCellDimensionsGetter(tableColumn, data) {
    if (tableColumn.type === TABLE_DATA_TYPE) {
      this.cellDimensionGetters[tableColumn.column.name] = data;
    }
  }
  handleOver({ payload, clientOffset: { x } }) {
    const sourceColumnName = payload[0].columnName;
    const availableColumns = this.getAvailableColumns();
    const relativeSourceColumnIndex = availableColumns.indexOf(sourceColumnName);

    if (relativeSourceColumnIndex === -1) return;

    const cellDimensions = this.getCellDimensions();
    const overlappedColumns = cellDimensions
      .filter(({ left, right }) => left <= x && x <= right);

    if (overlappedColumns.length > 1) return;

    const relativeTargetIndex = getTableTargetColumnIndex(
      cellDimensions,
      relativeSourceColumnIndex,
      x,
    );

    if (relativeTargetIndex === -1) return;

    const {
      sourceColumnIndex: prevSourceColumnIndex,
      targetColumnIndex: prevTargetColumnIndex,
    } = this.getState();
    const draftOrder = this.getDraftOrder();
    const targetColumnIndex = draftOrder.indexOf(availableColumns[relativeTargetIndex]);

    if (targetColumnIndex === prevTargetColumnIndex) return;

    const sourceColumnIndex = prevSourceColumnIndex === -1
      ? draftOrder.indexOf(sourceColumnName)
      : prevSourceColumnIndex;

    this.setState({
      sourceColumnIndex,
      targetColumnIndex,
    });
  }
  handleLeave() {
    this.setState({
      sourceColumnIndex: -1,
      targetColumnIndex: -1,
    });
  }
  handleDrop() {
    const { sourceColumnIndex, targetColumnIndex, order } = this.getState();
    const { onOrderChange } = this.props;
    const nextOrder = changeColumnOrder(order, {
      sourceColumnName: order[sourceColumnIndex],
      targetColumnName: order[targetColumnIndex],
    });

    this.setState({
      order: nextOrder,
      sourceColumnIndex: -1,
      targetColumnIndex: -1,
    });

    if (onOrderChange) {
      onOrderChange(nextOrder);
    }
  }
  render() {
    const {
      tableContainerComponent: Container,
      rowComponent: Row,
      cellComponent: Cell,
    } = this.props;

    const columnsComputed = ({ tableColumns }) =>
      orderedColumns(tableColumns, this.getDraftOrder());

    this.cellDimensionGetters = {};

    return (
      <PluginContainer
        pluginName="TableColumnReordering"
        dependencies={pluginDependencies}
      >
        <Getter name="tableColumns" computed={columnsComputed} />
        <Getter name="tableHeaderRows" computed={tableHeaderRowsComputed} />
        <Template name="table">
          {params => (
            <Container
              {...params}
              onOver={this.onOver}
              onLeave={this.onLeave}
              onDrop={this.onDrop}
            >
              <TemplatePlaceholder />
            </Container>
          )}
        </Template>
        <Template
          name="tableRow"
          predicate={({ tableRow }) => tableRow.type === TABLE_REORDERING_TYPE}
        >
          {params => (
            <Row {...params} />
          )}
        </Template>
        <Template
          name="tableCell"
          predicate={({ tableRow }) => tableRow.type === TABLE_REORDERING_TYPE}
        >
          {params => (
            <Cell
              {...params}
              getCellDimensions={fn =>
                this.storeCellDimensionsGetter(params.tableColumn, fn)}
            />
          )}
        </Template>
      </PluginContainer>
    );
  }
}

TableColumnReordering.propTypes = {
  order: PropTypes.arrayOf(PropTypes.string),
  defaultOrder: PropTypes.arrayOf(PropTypes.string),
  onOrderChange: PropTypes.func,
  tableContainerComponent: PropTypes.func.isRequired,
  rowComponent: PropTypes.func.isRequired,
  cellComponent: PropTypes.func.isRequired,
};

TableColumnReordering.defaultProps = {
  order: undefined,
  defaultOrder: undefined,
  onOrderChange: undefined,
};
