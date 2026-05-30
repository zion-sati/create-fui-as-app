import { Column, Disposable, FlexBox, SelectionArea, Theme, activeTheme, bindTheme, disposeAll, Text, Unit } from "../../fui/Fui";
import { createNavBar } from "../shared/design-system/NavBar";
import { PrimaryButton } from "../shared/design-system/PrimaryButton";
import { HomeModel } from "./HomeModel";

export class HomeView {
  readonly actionButton: PrimaryButton;
  private readonly statusText: Text;
  private readonly hostServiceText: Text;
  private readonly hostEventText: Text;
  private readonly root!: SelectionArea;
  private readonly themeBindings: Array<Disposable> = new Array<Disposable>();
  private themeBindingDisposed: bool = false;

  constructor(model: HomeModel) {
    const navBar = createNavBar(true);

    const title = new Text(model.title).fontSize(34.0) as Text;
    const subtitle = new Text(model.subtitle).fontSize(16.0) as Text;
    this.statusText = new Text("Home counter: 0").fontSize(18.0) as Text;
    this.hostServiceText = new Text("Host service time: -").fontSize(15.0) as Text;
    this.hostEventText = new Text("Host event tick: -").fontSize(15.0) as Text;
    this.actionButton = new PrimaryButton(model.actionLabel);

    const content = Column(
      navBar,
      new FlexBox().height(24.0, Unit.Pixel),
      title,
      new FlexBox().height(12.0, Unit.Pixel),
      subtitle,
      new FlexBox().height(20.0, Unit.Pixel),
      this.statusText,
      new FlexBox().height(10.0, Unit.Pixel),
      this.hostServiceText,
      this.hostEventText,
      new FlexBox().height(16.0, Unit.Pixel),
      this.actionButton,
    )
      .width(100.0, Unit.Percent)
      .height(100.0, Unit.Percent)
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

  setActionCount(count: i32): void {
    this.statusText.text("Home counter: " + count.toString());
  }

  setHostServiceSeconds(value: i32): void {
    this.hostServiceText.text("Host service time: " + value.toString());
  }

  setHostEventSeconds(value: i32): void {
    this.hostEventText.text("Host event tick: " + value.toString());
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
