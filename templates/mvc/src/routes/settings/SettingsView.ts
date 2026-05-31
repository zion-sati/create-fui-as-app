import { Column, Disposable, FlexBox, SelectionArea, Theme, activeTheme, bindTheme, disposeAll, Text, Unit } from "../../fui/Fui";
import { createNavBar } from "../shared/design-system/NavBar";
import { PrimaryButton } from "../shared/design-system/PrimaryButton";
import { SettingsModel } from "./SettingsModel";

export class SettingsView {
  readonly actionButton: PrimaryButton;
  private readonly statusText: Text;
  private readonly root!: SelectionArea;
  private readonly themeBindings: Array<Disposable> = new Array<Disposable>();
  private themeBindingDisposed: bool = false;

  constructor(model: SettingsModel) {
    const navBar = createNavBar(false);

    const title = new Text(model.title).fontSize(34.0) as Text;
    const subtitle = new Text(model.subtitle).fontSize(16.0) as Text;
    this.statusText = new Text("Settings saved: 0").fontSize(18.0) as Text;
    this.actionButton = new PrimaryButton(model.actionLabel);

    const content = Column(
      navBar,
      new FlexBox().height(24.0, Unit.Pixel),
      title,
      new FlexBox().height(12.0, Unit.Pixel),
      subtitle,
      new FlexBox().height(20.0, Unit.Pixel),
      this.statusText,
      new FlexBox().height(16.0, Unit.Pixel),
      this.actionButton,
    )
      .fillSize()
      .padding(24.0, 24.0, 24.0, 24.0);

    this.root = new SelectionArea()
      .fillWidth()
      .fillHeight()
      .child(content) as SelectionArea;
    this.trackTheme(bindTheme(this, (view, theme): void => {
      view.applyTheme(theme);
    }));
    this.applyTheme(activeTheme.value);
  }

  getRoot(): SelectionArea {
    return this.root;
  }

  dispose(): void {
    this.disposeThemeBindings();
  }

  setSaveCount(count: i32): void {
    this.statusText.text("Settings saved: " + count.toString());
  }

  private applyTheme(theme: Theme): void {
    this.root.bgColor(theme.colors.background);
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
