import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import { merge } from 'lodash';

import {
  VIEW_EDITOR_RENDER_MODES_ALWAYS,
  VIEW_EDITOR_RENDER_MODES_ON_DEMAND,
} from '../../constants/Constants';
import TableCell from './TableCell';
import { shouldRenderColumn } from '../../utils/tableHelpers';

class TableItem extends PureComponent {
  constructor(props) {
    super(props);

    const multilineText = props.cols.filter(item => item.multilineText === true)
      .length;

    let multilineTextLines = 0;
    props.cols.forEach(col => {
      if (
        col.multilineTextLines &&
        col.multilineTextLines > multilineTextLines
      ) {
        multilineTextLines = col.multilineTextLines;
      }
    });

    this.state = {
      edited: '',
      activeCell: '',
      updatedRow: false,
      listenOnKeys: true,
      editedCells: {},
      multilineText,
      multilineTextLines,
    };
  }

  componentDidUpdate(prevProps) {
    const { multilineText } = this.state;

    if (multilineText && this.props.isSelected !== prevProps.isSelected) {
      this.handleCellExtend();
    }
  }

  isCellEditable = item => {
    const { fieldsByName } = this.props;
    const { editedCells } = this.state;
    const cells = merge({}, fieldsByName, editedCells);
    const property = item.fields[0].field;

    return (
      (cells &&
        cells[property] &&
        cells[property].viewEditorRenderMode ===
          VIEW_EDITOR_RENDER_MODES_ON_DEMAND) ||
      item.viewEditorRenderMode === VIEW_EDITOR_RENDER_MODES_ON_DEMAND
    );
  };

  getCell = colIdx => this.props.cols[colIdx];

  prepareWidgetData = item => {
    const { fieldsByName } = this.props;
    const widgetData = item.fields.map(prop => fieldsByName[prop.field]);

    return widgetData;
  };

  initPropertyEditor = fieldName => {
    const { cols, fieldsByName } = this.props;

    if (cols && fieldsByName) {
      cols.map(item => {
        const property = item.fields[0].field;
        if (property === fieldName) {
          const widgetData = this.prepareWidgetData(item);

          if (widgetData) {
            this.handleEditProperty(null, property, true, widgetData[0]);
          }
        }
      });
    }
  };

  handleEditProperty = (e, property, focusWidget, item) => {
    const { activeCell } = this.state;
    const elem = document.activeElement;

    // TODO: this won't be necessary
    if (activeCell !== elem && !elem.className.includes('js-input-field')) {
    // if (activeCell !== elem) {
      this.setState({
        activeCell: elem,
      });
    }

    this.editProperty(e, property, focusWidget, item);
  };

  editProperty = (e, property, focusWidget, item) => {
    if (item ? !item.readonly : true) {
      if (this.state.edited === property) e && e.stopPropagation();

      this.setState(
        {
          edited: property,
        },
        () => {
          if (focusWidget) {
            const elem = document.activeElement.getElementsByClassName(
              'js-input-field'
            )[0];

            // TODO: We need to focus attributes button if it exists

            if (elem) {
              elem.focus();
            }

            const disabled = document.activeElement.querySelector(
              '.input-disabled'
            );
            const readonly = document.activeElement.querySelector(
              '.input-readonly'
            );

            if (disabled || readonly) {
              this.listenOnKeysTrue();
              this.handleEditProperty(e);
            } else {
              this.listenOnKeysFalse();
            }
          }
        }
      );
    }
  };

  handleDoubleClick = () => {
    const { rowId, onDoubleClick, supportOpenRecord } = this.props;

    if (supportOpenRecord) {
      onDoubleClick && onDoubleClick(rowId);
    }
  };

//   handleKeyDown = e => {
//     const { changeListenOnTrue, widgetData, property } = this.props;
  handleKeyDown = (e, property, widgetData) => {
    const { changeListenOnTrue } = this.props;
    const { listenOnKeys, edited } = this.state;
    console.log('TableItem handleKeyDown: ', e.key, listenOnKeys, property, widgetData);

    switch (e.key) {
      case 'Enter':
        if (listenOnKeys) {
          console.log('TableItem ENTER: ', property, widgetData)
          this.handleEditProperty(e, property, true, widgetData[0]);
        }
        break;
      case 'Tab':
      case 'Escape':
        if (edited === property) {
          e.stopPropagation();
          this.handleEditProperty(e);
          changeListenOnTrue();
        }
        break;
    }
  };

  listenOnKeysTrue = () => {
    const { changeListenOnTrue } = this.props;

    this.setState({
      listenOnKeys: true,
    });
    changeListenOnTrue();
  };

  listenOnKeysFalse = () => {
    const { changeListenOnFalse } = this.props;

    this.setState({
      listenOnKeys: false,
    });
    changeListenOnFalse();
  };

  closeTableField = e => {
    const { activeCell } = this.state;

    this.handleEditProperty(e);
    this.listenOnKeysTrue();

    activeCell && activeCell.focus();
  };

  isAllowedFieldEdit = item =>
    item.viewEditorRenderMode === VIEW_EDITOR_RENDER_MODES_ON_DEMAND;

  /*
   * This function is called when cell's value changes
   */
  handleCellValueChange = (rowId, property, value, ret) => {
    const { onItemChange } = this.props;
    const editedCells = { ...this.state.editedCells };

    console.log('handleCellValueChange');

    // this is something we're not doing usually as all field
    // layouts come from the server. But in cases of modals
    // sometimes we need to modify the state of fields that are displayed
    // for instance to show/hide them
    if (ret) {
      ret.then(resp => {
        if (resp[0] && resp[0].fieldsByName) {
          const fields = resp[0].fieldsByName;

          for (let [k, v] of Object.entries(fields)) {
            editedCells[k] = v;
          }
        }

        this.setState(
          {
            editedCells,
          },
          () => onItemChange(rowId, property, value)
        );
      });
    } else {
      onItemChange(rowId, property, value);
    }
  };

  handleCellFocused = (e, widgetData, row, col) => {
    // console.log('ELEMENT: ', element);
    const cell = this.getCell(col);
    const property = cell.fields[0].field;
    const isEditable = this.isCellEditable(cell);

    console.log('TableItem handleCellFocused: ', isEditable, cell)

    // element.focus();
    // if (isEditable) {
      this.handleEditProperty(e, property, true, widgetData);
    // }
  };

  handleCellExtend = () => {
    this.setState({
      cellsExtended: !this.state.cellsExtended,
    });
  };

  handleClickOutside = e => {
    const { changeListenOnTrue } = this.props;

    this.handleEditProperty(e);
    changeListenOnTrue();
  };

  renderCells = () => {
    const {
      cols,
      fieldsByName,
      windowId,
      docId,
      rowId,
      tabId,
      mainTable,
      newRow,
      tabIndex,
      entity,
      getSizeClass,
      handleRightClick,
      caption,
      colspan,
      viewId,
      isSelected,
    } = this.props;
    const {
      edited,
      updatedRow,
      listenOnKeys,
      editedCells,
      cellsExtended,
      multilineText,
      multilineTextLines,
    } = this.state;
    const cells = merge({}, fieldsByName, editedCells);

    // Iterate over layout settings
    if (colspan) {
      return <td colSpan={cols.length}>{caption}</td>;
    } else {
      return (
        cols &&
        cols.map((item, colIdx) => {
          if (shouldRenderColumn(item)) {
            const { supportZoomInto } = item.fields[0];
            const supportFieldEdit = mainTable && this.isAllowedFieldEdit(item);
            const property = item.fields[0].field;
            let isEditable = this.isCellEditable(item);
            const isEdited = edited === property;
            const extendLongText = multilineText ? multilineTextLines : 0;

            let showWidget =
              (cells &&
                cells[property] &&
                cells[property].viewEditorRenderMode ===
                  VIEW_EDITOR_RENDER_MODES_ALWAYS) ||
              item.viewEditorRenderMode === VIEW_EDITOR_RENDER_MODES_ALWAYS;

            let widgetData = item.fields.map(prop => {
              if (cells) {
                let cellWidget = cells[prop.field] || -1;

                if (
                  isEditable ||
                  (supportFieldEdit && typeof cellWidget === 'object')
                ) {
                  cellWidget = {
                    ...cellWidget,
                    widgetType: item.widgetType,
                    displayed: true,
                    readonly: false,
                  };
                }
                return cellWidget;
              }
              return -1;
            });
            // HACK: Color fields should always be readonly
            if (item.widgetType === 'Color') {
              showWidget = false;
              isEditable = false;
            }

            // console.log('isEditable: ', isEditable, cells[property], item.viewEditorRenderMode, showWidget)

            return (
              <TableCell
                {...{
                  getSizeClass,
                  entity,
                  windowId,
                  docId,
                  rowId,
                  colIdx,
                  tabId,
                  item,
                  widgetData,
                  tabIndex,
                  listenOnKeys,
                  caption,
                  mainTable,
                  viewId,
                  extendLongText,
                  isEditable,
                  showWidget,
                  cellsExtended,
                  isEdited,
                  property,
                }}
                key={`${rowId}-${property}`}
                isRowSelected={isSelected}
                handleDoubleClick={e => {
                  if (isEditable) {
                    this.handleEditProperty(e, property, true, widgetData[0]);
                  }
                }}
                _handleDoubleClick={this.handleCellFocused}
                onClickOutside={this.handleClickOutside}
                onCellChange={this.handleCellValueChange}
                onCellExtend={this.handleCellExtend}
                onCellFocused={this.handleCellFocused}
                updatedRow={updatedRow || newRow}
                updateRow={this.updateRow}
                handleKeyDown={this.handleKeyDown}
                listenOnKeysTrue={this.listenOnKeysTrue}
                listenOnKeysFalse={this.listenOnKeysFalse}
                closeTableField={e => this.closeTableField(e)}
                handleRightClick={e =>
                  handleRightClick(
                    e,
                    property,
                    supportZoomInto,
                    supportFieldEdit
                  )
                }
              />
            );
          }
        })
      );
    }
  };

  updateRow = () => {
    this.setState(
      {
        updatedRow: true,
      },
      () => {
        setTimeout(() => {
          this.setState({
            updatedRow: false,
          });
        }, 1000);
      }
    );
  };

  nestedSelect = (elem, cb) => {
    let res = [];

    elem &&
      elem.map(item => {
        res = res.concat([item.id]);

        if (item.includedDocuments) {
          res = res.concat(this.nestedSelect(item.includedDocuments));
        } else {
          cb && cb();
        }
      });

    return res;
  };

  handleIndentSelect = (e, id, elem) => {
    const { handleSelect } = this.props;
    e.stopPropagation();
    handleSelect(this.nestedSelect(elem).concat([id]));
  };

  getIconClassName = huType => {
    switch (huType) {
      case 'LU':
        return 'meta-icon-pallete';
      case 'TU':
        return 'meta-icon-package';
      case 'CU':
        return 'meta-icon-product';
      case 'PP_Order_Receive':
        return 'meta-icon-receipt';
      case 'PP_Order_Issue':
        return 'meta-icon-issue';
      case 'M_Picking_Slot':
        // https://github.com/metasfresh/metasfresh/issues/2298
        return 'meta-icon-beschaffung';
    }
  };

  renderTree = huType => {
    const {
      indent,
      lastChild,
      includedDocuments,
      rowId,
      collapsed,
      handleRowCollapse,
      collapsible,
    } = this.props;

    let indentation = [];

    for (let i = 0; i < indent.length; i++) {
      indentation.push(
        <div
          key={i}
          className={classnames('indent-item-mid', {
            'indent-collapsible-item-mid': collapsible,
          })}
        >
          {i === indent.length - 1 && <div className="indent-mid" />}
          <div
            className={classnames({
              'indent-sign': indent[i],
              'indent-sign-bot': lastChild && i === indent.length - 1,
            })}
          />
        </div>
      );
    }

    return (
      <div className={'indent'}>
        {indentation}
        {includedDocuments && !collapsed && (
          <div
            className={classnames('indent-bot', {
              'indent-collapsible-bot': collapsible,
            })}
          />
        )}
        {includedDocuments && collapsible ? (
          collapsed ? (
            <i
              onClick={handleRowCollapse}
              className="meta-icon-plus indent-collapse-icon"
            />
          ) : (
            <i
              onClick={handleRowCollapse}
              className="meta-icon-minus indent-collapse-icon"
            />
          )
        ) : (
          ''
        )}
        <div
          className="indent-icon"
          onClick={e => this.handleIndentSelect(e, rowId, includedDocuments)}
        >
          <i className={this.getIconClassName(huType)} />
        </div>
      </div>
    );
  };

  render() {
    const {
      key,
      isSelected,
      onClick,
      odd,
      indentSupported,
      indent,
      contextType,
      lastChild,
      processed,
      includedDocuments,
      notSaved,
      caption,
    } = this.props;

    return (
      <tr
        key={key}
        onClick={onClick}
        onDoubleClick={this.handleDoubleClick}
        className={classnames({
          'row-selected': isSelected,
          'tr-odd': odd,
          'tr-even': !odd,
          'row-disabled': processed,
          'row-boundary': processed && lastChild && !includedDocuments,
          'row-not-saved': notSaved,
          'item-caption': caption,
        })}
      >
        {indentSupported && indent && (
          <td className="indented">{this.renderTree(contextType)}</td>
        )}
        {this.renderCells()}
      </tr>
    );
  }
}

TableItem.propTypes = {
  dispatch: PropTypes.func.isRequired,
  onClick: PropTypes.func.isRequired,
  handleSelect: PropTypes.func,
  onDoubleClick: PropTypes.func,
  indentSupported: PropTypes.bool,
  collapsed: PropTypes.bool,
  processed: PropTypes.bool,
  notSaved: PropTypes.bool,
  isSelected: PropTypes.bool,
};

export default connect(
  false,
  false,
  false,
  { withRef: true }
)(TableItem);
