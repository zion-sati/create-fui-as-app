import { Button } from "../../../fui/Fui";

const BUTTON_RADIUS: f32 = 12.0;
const BUTTON_PADDING_X: f32 = 18.0;
const BUTTON_PADDING_Y: f32 = 10.0;
export class PrimaryButton extends Button {
  constructor(label: string) {
    super(label);
    this
      .cornerRadius(BUTTON_RADIUS)
      .padding(BUTTON_PADDING_X, BUTTON_PADDING_Y, BUTTON_PADDING_X, BUTTON_PADDING_Y)
      .fontSize(14.0);
  }
}
