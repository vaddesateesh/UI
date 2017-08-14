import {Input, OnDestroy, Component, Output, EventEmitter, OnInit, HostListener, ViewChild} from "@angular/core";
import {DropdownOption} from "../../auto/quote/test/DropdownOption";


@Component({
  selector: 'dropdown-covergage',
  templateUrl: './dropdown.component.html',
  styleUrls: ['dropdown.component.scss'],
  inputs: ['values', 'default'],
  outputs: ['selected-index', 'selected-value'],
})
export class DropdownComponent {
  @ViewChild('dropdown') dropdown: any;
  @Input('values') values: DropdownOption[];
  @Input('default') default: string;
  @Output('selected-index') selectedIndexChanged = new EventEmitter<number>();
  @Output('selected-value') selectedValueChanged = new EventEmitter<DropdownOption>();
  selectedIndex: number = 0;
  selectedValue: DropdownOption;
  defaultValueIndex: number;
  opened: boolean = false;
  style: any = {};
  optionsPosition: string = "bottom";
  icon_star_white:string = "https://ts0.hfdstatic.com/plstatic/int/sales/img/icon-star-white.png";
  icon_star:string = "https://ts0.hfdstatic.com/plstatic/int/sales/img/icon-star.png";

  ngOnInit() {
    if (this.values.length) {
      if (this.default) {
        for (var i = 0; i < this.values.length; i++) {
          var element = this.values[i];
          if (element.value == this.default) {
            this.selectedValue = this.values[i];
            this.selectedIndex = i;
            this.defaultValueIndex = i;
          }
        }
      }
      else {
        this.defaultValueIndex = 0;
        this.selectedIndex = 0;
        this.selectedValue = this.values[0];
      }
    }
  }

  /** get dropdown position based on device screen, calculate position with relation to
   * scrollY and handle dynamic dropdown position
   **/

  @HostListener("window:scroll", [])
  onWindowScroll() {
    var clientHeight = window.innerHeight;
    var scrollUp = window.scrollY;
    var screenBottomPosition = clientHeight + scrollUp;
    var dropdownPosition = this.dropdown.nativeElement.getBoundingClientRect().top;

    if (screenBottomPosition < (dropdownPosition + clientHeight / 2)) {
      this.optionsPosition = "top";
    }
    else {
      console.log("bottom");
      this.optionsPosition = "bottom";
    }
    if (this.opened) {
      this.setOptionsPosition(100);
    }else{
      this.setOptionsPosition(120);

    }
  }

  /** set position of option and up or down
   **/

  setOptionsPosition(percent: number) {
    if (this.optionsPosition == "top") {
      this.style = {
        "bottom": percent + "%"
      }
    }
    else if (this.optionsPosition == "bottom") {
      this.style = {
        "top": percent + "%"
      }
    } else {
      this.style = {
        "top": percent + "%"
      }
    }
  }

  /** expand dropdown handler, even and position
   **/

  expandOptions() {
    this.opened = !this.opened;
    if (this.opened) {
      this.setOptionsPosition(100);
    }
    else {
      this.setOptionsPosition(120);
    }
  }

  /** Set selected value from array here
   **/

  selectOption(i: number, option: DropdownOption)
  {
    this.selectedValue = option;
    this.selectedIndex = i;

    this.indexChanged();
    this.valueChanged();
  }

  indexChanged() {
    //emit a index changed to the listener (parent component)
    this.selectedIndexChanged.emit(this.selectedIndex);
  }

  /** event handler when selected value is changed
   **/
  valueChanged() {
    //emit a value changed to the listener (parent component)
    this.selectedValueChanged.emit(this.selectedValue);
  }
}
