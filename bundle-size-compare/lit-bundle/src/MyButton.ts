import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";

@customElement("my-button")
export class MyButton extends LitElement {
  @property({ type: String }) label = "Click me";
  @state() private count = 0;

  static styles = css`
    button {
      background: blue;
      color: white;
      padding: 0.5rem 1rem;
    }
  `;

  updated(changedProperties: Map<string, unknown>) {
    if (changedProperties.has("count")) {
      console.log(`Clicked ${this.count} times`);
    }
  }

  private handleClick() {
    this.count += 1;
  }

  render() {
    return html`
      <button @click=${this.handleClick}>${this.label} (${this.count})</button>
    `;
  }
}
