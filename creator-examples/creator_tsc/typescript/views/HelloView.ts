//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/typescript/index.html
// Learn Attribute:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/reference/attributes/index.html
// Learn life-cycle callbacks:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/life-cycle-callbacks/index.html
// const { ccclass, property } = cc._decorator;
// @ccclass
// export class NewClass extends cc.Component {

// }

import {CCComponent, CCProperty, CCEditor} from "../decorators/ComponentDecorators";
import {AbstractComponent} from "./AbstractComponent";
import {HelloController} from "../controllers/HelloController";
import {HelloModel} from "../models/HelloModel";
@CCEditor({
    executeInEditMode: true
})
@CCComponent
export class HelloView extends AbstractComponent<HelloController, HelloModel> {
    @CCProperty(cc.Label)
    private ipLabel: cc.Label;
    @CCProperty(cc.Label)
    private countryLabel: cc.Label;
    @CCProperty(cc.Label)
    private cityLabel: cc.Label;
    @CCProperty(cc.Label)
    private countyLabel: cc.Label;

    public onLoad() {
        this.initLabels();
        this.controller = new HelloController();
        this.controller.init(this);
        this.move10();
    }

    private initLabels() {
        this.ipLabel.string = "正在加载IP...";
        this.countryLabel.string = "";
        this.cityLabel.string = "";
        this.countyLabel.string = "";
    }

    public updateIP(res: IPFetchResult) {
        if (res.code == 0 && res.data !== null) {
            this.ipLabel.string = res.data.ip;
            this.countryLabel.string = "正在加载国家信息";
            this.cityLabel.string = "正在加载城市信息";
            this.countyLabel.string = "正在加载区域信息";
        } else {
            this.ipLabel.string = "获取IP失败";
        }
    }

    public updateIPInfo(res: IPInfoFetchResult) {
        if (res.code == 0 && res.data !== null) {
            this.countryLabel.string = res.data.country;
            this.cityLabel.string = res.data.city;
            this.countyLabel.string = res.data.county;
        } else {
            this.countryLabel.string = "加载国家信息失败";
            this.cityLabel.string = "加载城市信息失败";
            this.countyLabel.string = "加载区域信息失败";
        }
    }

    private async move10() {
        for (let i = 0; i < 10; i++) {
            await this.asyncRunAction(this.ipLabel.node, cc.sequence(
                cc.moveBy(0.5, -10, 0),
                cc.moveBy(0.5, 10, 0)
            ));
        }
    }

    private async asyncRunAction(node: cc.Node, action: cc.Action) {
        return new Promise<void>((resolve, reject) => {
            node.runAction(cc.sequence(
                action,
                cc.callFunc(resolve)
            ));
        });
    }
}