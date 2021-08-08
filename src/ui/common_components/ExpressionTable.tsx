/**
 * Copyright (c) 2017-2020 Kenny Do and CAD Team (https://github.com/Cookie-AutoDelete/Cookie-AutoDelete/graphs/contributors)
 * Licensed under MIT (https://github.com/Cookie-AutoDelete/Cookie-AutoDelete/blob/3.X.X-Branch/LICENSE)
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
import { Component } from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import shortid from 'shortid';
import { removeExpressionUI, updateExpressionUI } from '../../redux/Actions';
import { sleep, validateExpressionDomain } from '../../services/Libs';
import { ReduxAction } from '../../typings/ReduxConstants';
import ExpressionOptions from './ExpressionOptions';
import IconButton from './IconButton';
import TextInputEditable from './TextInputEditable';

class EmptyState {
  public expressionInput = '';
  public editMode = false;
  public id: string | undefined = '';
  public invalid = '';
}

interface OwnProps {
  expressions: ReadonlyArray<Expression>;
  expressionColumnTitle: string;
  storeId: string;
  emptyElement: JSX.Element;
}

interface DispatchProps {
  onRemoveExpression: (payload: Expression) => void;
  onUpdateExpression: (payload: Expression) => void;
}

type ExpressionTableProps = DispatchProps & OwnProps;

class ExpressionTable extends Component<ExpressionTableProps, EmptyState> {
  private editInput: HTMLInputElement | undefined | null;
  constructor(props: ExpressionTableProps) {
    super(props);
    this.state = new EmptyState();
  }

  public startEditing(expression: Expression) {
    this.setState({
      editMode: true,
      expressionInput: expression.expression,
      id: expression.id,
      invalid: '',
    });
  }

  public componentDidUpdate() {
    if (
      this.editInput &&
      this.state.editMode &&
      document.activeElement !== document.getElementById('formText')
    ) {
      this.editInput.focus();
    }
  }

  public clearEdit() {
    if (this.editInput) {
      if (this.editInput.parentElement) {
        this.editInput.parentElement.classList.remove('was-validated');
      }
      this.editInput.setCustomValidity('');
      this.editInput.checkValidity();
      this.editInput = undefined;
    }
    this.setState(new EmptyState());
  }

  public commitEdit() {
    if (!this.validateEdit()) return;
    const original = (this.props.expressions || []).find(
      (expression) => expression.id === this.state.id,
    );
    if (original) {
      this.props.onUpdateExpression({
        ...original,
        expression: this.state.expressionInput,
        storeId: this.props.storeId,
      });
    }
    sleep(200).then(() => this.clearEdit());
  }

  public validateEdit(): boolean {
    if (!this.state.editMode || !this.editInput || !this.state.id) return false;
    const result = validateExpressionDomain(
      this.state.expressionInput.trim(),
    ).trim();
    if (result) {
      // validation failed.
      return this.setInvalid(result);
    }
    // Past this point, presume valid expression entry.
    this.editInput.setCustomValidity('');
    if (this.editInput.parentElement) {
      this.editInput.parentElement.classList.remove('was-validated');
    }
    this.editInput.checkValidity();
    return true;
  }

  public render() {
    const {
      onRemoveExpression,
      onUpdateExpression,
      expressionColumnTitle,
      emptyElement,
    } = this.props;
    const { editMode, id, expressionInput, invalid } = this.state;
    const expressions =
      this.props.expressions === undefined ? [] : this.props.expressions;

    if (expressions.length === 0) {
      return emptyElement;
    }

    return (
      <table className="table table-striped table-hover table-bordered">
        <thead>
          <tr>
            <th scope="col" />
            <th scope="col">{expressionColumnTitle}</th>
            <th scope="col">{browser.i18n.getMessage('optionsText')}</th>
            <th scope="col">{browser.i18n.getMessage('listTypeText')}</th>
          </tr>
        </thead>
        <tbody className="expressionTable">
          {expressions.map((expression) => (
            <tr key={`${expression.expression}-${expression.listType}`}>
              <td
                style={{
                  textAlign: 'center',
                }}
              >
                <IconButton
                  title={browser.i18n.getMessage('removeExpressionText')}
                  className="btn-outline-danger"
                  iconName="trash"
                  onClick={() => {
                    onRemoveExpression(expression);
                  }}
                />
              </td>
              <td className="editableExpression">
                <TextInputEditable
                  altEditClear={browser.i18n.getMessage('stopEditingText')}
                  altEditSave={browser.i18n.getMessage('saveExpressionText')}
                  altEditStart={browser.i18n.getMessage('editExpressionText')}
                  canEdit={editMode && id === expression.id}
                  editValue={expressionInput}
                  invalidFeedback={invalid}
                  name={expression.id || shortid.generate()}
                  onChange={(e) =>
                    this.setState({
                      expressionInput: e.target.value,
                    })
                  }
                  onEditClear={() => this.clearEdit()}
                  onEditSave={() => this.commitEdit()}
                  onEditStart={() => this.startEditing(expression)}
                  ref={(c) => (this.editInput = c)}
                  type="url"
                  value={expression.expression}
                />
              </td>
              <td>
                <div
                  style={{
                    verticalAlign: 'middle',
                  }}
                >
                  <ExpressionOptions expression={expression} />
                </div>
              </td>
              <td>
                <div
                  style={{
                    display: 'block',
                    verticalAlign: 'middle',
                  }}
                >
                  {`${
                    expression.listType === 'WHITE'
                      ? browser.i18n.getMessage('whiteListWordText')
                      : browser.i18n.getMessage('greyListWordText')
                  }`}
                </div>
                <IconButton
                  title={`${
                    expression.listType === 'WHITE'
                      ? browser.i18n.getMessage('toggleToGreyListWordText')
                      : browser.i18n.getMessage('toggleToWhiteListWordText')
                  }`}
                  iconName="exchange-alt"
                  className="btn-outline-dark showOnRowHover"
                  styleReact={{
                    marginTop: '5px',
                    width: '100%',
                  }}
                  onClick={() =>
                    onUpdateExpression({
                      ...expression,
                      listType:
                        expression.listType === ListType.GREY
                          ? ListType.WHITE
                          : ListType.GREY,
                    })
                  }
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
  private setInvalid(s: string): boolean {
    if (!this.editInput) return false;
    this.setState({
      invalid: s,
    });
    this.editInput.setCustomValidity(s);
    if (this.editInput.parentElement) {
      this.editInput.parentElement.classList.add('was-validated');
    }
    this.editInput.checkValidity();
    // should always return false since we set error above.
    return false;
  }
}

const mapDispatchToProps = (dispatch: Dispatch<ReduxAction>) => ({
  onRemoveExpression(payload: Expression) {
    dispatch(removeExpressionUI(payload));
  },
  onUpdateExpression(payload: Expression) {
    dispatch(updateExpressionUI(payload));
  },
});
export default connect(null, mapDispatchToProps)(ExpressionTable);
