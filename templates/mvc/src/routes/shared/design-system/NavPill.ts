import { Disposable, Theme, activeTheme, bindTheme, disposeAll, NavLink, Text } from "../../../fui/Fui";

const PILL_RADIUS: f32 = 999.0;
const PILL_PADDING_X: f32 = 16.0;
const PILL_PADDING_Y: f32 = 8.0;
export class NavPill extends NavLink {
  private readonly labelNode: Text;
  private readonly themeBindings: Array<Disposable> = new Array<Disposable>();
  private themeBindingDisposed: bool = false;
  private activeValue: bool = false;

  constructor(href: string, label: string) {
    super(href, label, false);
    this.labelNode = new Text(label)
      .fontSize(14.0)
      .selectable(false) as Text;
    this
      .cornerRadius(PILL_RADIUS)
      .padding(PILL_PADDING_X, PILL_PADDING_Y, PILL_PADDING_X, PILL_PADDING_Y)
      .child(this.labelNode);
    this.trackTheme(bindTheme(this, (pill, theme): void => {
      pill.applyVisualState(theme);
    }));
    this.applyVisualState(activeTheme.value);
  }

  active(flag: bool = true): this {
    this.activeValue = flag;
    this.applyVisualState(activeTheme.value);
    return this;
  }

  dispose(): void {
    this.disposeThemeBindings();
    super.dispose();
  }

  private applyVisualState(theme: Theme): void {
    if (this.activeValue) {
      this.bgColor(theme.colors.accent);
      this.labelNode.textColor(theme.colors.textPrimary);
      return;
    }
    this.bgColor(theme.colors.surface);
    this.labelNode.textColor(theme.colors.textMuted);
  }

  private trackTheme(disposable: Disposable): void {
    this.themeBindings.push(disposable);
  }

  private disposeThemeBindings(): void {
    if (this.themeBindingDisposed) {
      return;
    }
    this.themeBindingDisposed = true;
    disposeAll(this.themeBindings);
  }
}
