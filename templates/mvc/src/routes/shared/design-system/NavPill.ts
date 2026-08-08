import {
  activeTheme,
  bindTheme,
  Disposable,
  disposeAll,
  NavLink,
  NavLinkInteractionState,
  Text,
  Theme,
} from "../../../fui/Fui";

const PILL_RADIUS: f32 = 999.0;
const PILL_PADDING_X: f32 = 16.0;
const PILL_PADDING_Y: f32 = 8.0;
export class NavPill extends NavLink {
  private readonly themeBindings: Disposable[] = new Array<Disposable>();
  private themeBindingDisposed: bool = false;
  private activeValue: bool = false;
  private hoveredValue: bool = false;
  readonly labelNode: Text;

  constructor(href: string, label: string) {
    super(href, false);
    this.labelNode = new Text(label).fontSize(14.0).selectable(false) as Text;
    this
      .cornerRadius(PILL_RADIUS)
      .padding(PILL_PADDING_X, PILL_PADDING_Y, PILL_PADDING_X, PILL_PADDING_Y);
    this.child(this.labelNode).semanticLabel(label);
    this.bindInteractionState<NavPill>(this, applyNavPillInteractionState);
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
    if (this.activeValue || this.hoveredValue) {
      this.bgColor(theme.colors.accent);
      this.labelNode.textColor(theme.colors.textOnAccent);
      return;
    }
    this.bgColor(theme.colors.surface);
    this.labelNode.textColor(theme.colors.textMuted);
  }

  applyInteractionState(state: NavLinkInteractionState, theme: Theme): void {
    this.hoveredValue = state.hovered || state.pressed;
    this.applyVisualState(theme);
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

function applyNavPillInteractionState(
  pill: NavPill,
  state: NavLinkInteractionState,
  theme: Theme,
): void {
  pill.applyInteractionState(state, theme);
}
