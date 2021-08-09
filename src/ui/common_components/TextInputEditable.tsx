/**
 * Copyright (c) 2017-2021 Kenny Do and CAD Team (https://github.com/Cookie-AutoDelete/Cookie-AutoDelete/graphs/contributors)
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
import * as React from 'react';
import SettingsTooltip from '../settings/components/SettingsTooltip';
import { moveCaretToEnd } from '../UILibs';
import IconButton from './IconButton';
interface OwnProps {
  altEditClear: string;
  altEditSave: string;
  altEditStart: string;
  canEdit: boolean;
  defaultText?: string;
  editValue?: string;
  invalidFeedback?: string;
  name: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  onEditClear: () => void;
  onEditSave: () => void;
  onEditStart: () => void;
  text?: string;
  tooltipHref?: string;
  type?: string;
  value?: string;
}

type TitleProps = Pick<OwnProps, 'name' | 'text' | 'tooltipHref'>;

const TextInputTitle: React.FunctionComponent<TitleProps> = ({
  name,
  text,
  tooltipHref,
}) => {
  return (
    <div className="textInputTitle">
      {text && text.length > 0 && (
        <label htmlFor={name} aria-labelledby={name}>
          {text}
        </label>
      )}
      {tooltipHref && tooltipHref.length > 0 && (
        <SettingsTooltip hrefURL={tooltipHref} />
      )}
    </div>
  );
};

function TextInputEditable(
  props: React.PropsWithChildren<OwnProps>,
  ref: React.ForwardedRef<HTMLInputElement>,
) {
  const {
    altEditClear,
    altEditSave,
    altEditStart,
    canEdit,
    defaultText,
    editValue,
    invalidFeedback,
    name,
    onChange,
    onEditClear,
    onEditSave,
    onEditStart,
    text,
    tooltipHref,
    type,
    value,
  } = props;
  return canEdit ? (
    <div className="editableTextInput">
      <TextInputTitle name={name} text={text} tooltipHref={tooltipHref} />
      <input
        id={name}
        name={name}
        className="form-control"
        style={{ display: 'inline-block', margin: 0 }}
        ref={ref}
        autoFocus={true}
        value={decodeURIComponent((editValue || '').toString())}
        onFocus={moveCaretToEnd}
        onChange={onChange}
        onKeyUp={(e) => {
          const k = e.key.toLowerCase();
          if (k === 'enter') onEditSave;
          else if (k.includes('escape')) onEditClear;
        }}
        type={type || 'text'}
        formNoValidate={true}
      />
      {invalidFeedback && invalidFeedback.length > 0 && (
        <div className="invalid-feedback">{invalidFeedback}</div>
      )}
      <IconButton
        title={altEditClear}
        className="btn-outline-danger"
        iconName="ban"
        styleReact={{
          marginTop: '8px',
          width: '45%',
        }}
        onClick={onEditClear}
      />
      <IconButton
        title={altEditSave}
        className="btn-outline-success"
        iconName="save"
        styleReact={{
          float: 'right',
          marginTop: '8px',
          width: '45%',
        }}
        onClick={onEditSave}
      />
    </div>
  ) : (
    <div>
      <TextInputTitle name={name} text={text} tooltipHref={tooltipHref} />
      <textarea
        id={name}
        name={name}
        className="form-control form-control-plaintext"
        readOnly={true}
        rows={1}
        style={{
          margin: 0,
          overflowX: 'scroll',
          paddingLeft: '5px',
          paddingRight: '5px',
          resize: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        {decodeURIComponent(value || defaultText || '')}
      </textarea>
      <IconButton
        title={altEditStart}
        iconName="pen"
        className="btn-outline-info showOnRowHover"
        styleReact={{
          marginTop: '5px',
          width: '100%',
        }}
        onClick={onEditStart}
      />
    </div>
  );
}

export default React.forwardRef(TextInputEditable);
