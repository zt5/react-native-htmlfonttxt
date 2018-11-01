import React, {PureComponent} from "react";
import {Text} from "react-native";
import {Parser} from "htmlparser2-without-node-native";

/**
 * html转换成text嵌套
 * 支持font标签 color和size属性
 * style是默认文本的格式
 * */
export default class HtmlText extends PureComponent {
	static propTypes = {
		style: Text.propTypes.style,
	};

	constructor(props) {
		super(props);
		this.state = {
			arrsss: [],
		};
	}

	componentWillReceiveProps = (nextProps) => {
		this.parseTxt(nextProps.children);
	};
	componentDidMount = () => {
		this.parseTxt(this.props.children);
	};
	parseTxt = (val: string) => {
		if (val == null) val = "";
		let converter = new HtmlParser(val);
		converter.parse();
		let arrsss = converter.getHtmlFontParse().result;
		this.setState({arrsss});
	};
	marchArr = (arr: any [], start, end) => {
		let children = [];
		for (let i = start; i < end; i++) {
			let tmpVal = arr[i];
			if (tmpVal.text != null) {
				let textItem: HtmlFontText = tmpVal;
				children.push(<Text style={textItem.style} key={start + "/" + end + "/" + i}>{textItem.text}</Text>);
			} else if (tmpVal.beginTag != null) {
				let beginItem: HtmlFontBegin = tmpVal;
				let endIndex = beginItem.endTagIndex;
				//递归会排除掉当前tag开头和结尾的元素的数组(不包含tag本身)
				children.push(this.marchArr(arr, i + 1, endIndex));
				i = endIndex;
			}
		}
		return (
			<Text key={start + "/" + end}>{children}</Text>
		)
	};
	render = () => {
		let {arrsss} = this.state;
		let styles = this.props.style;
		return (
			<Text style={styles}>
				{this.marchArr(arrsss, 0, arrsss.length)}
			</Text>
		)
	}
}

class HtmlParser {
	reg: Map<string, AbstractHtmlParser> = new Map();
	val: string;

	constructor(val) {
		this.val = val;
		this.reg.set("font", new HtmlFontParser(val));
	}

	getHtmlFontParse = (): HtmlFontParser => {
		return this.reg.get("font");
	};

	parse = () => {
		let parser = new Parser({
			onopentag: (name, attribs) => {
				let exec: AbstractHtmlParser = this.reg.get(name);
				if (exec && exec.onopentag != null) exec.onopentag(name, attribs);
			},
			ontext: (text) => {
				this.reg.forEach((value: AbstractHtmlParser, key, mapObj) => {
					if (value && value.ontext != null) value.ontext(text);
				});
			},
			onclosetag: (name) => {
				let exec: AbstractHtmlParser = this.reg.get(name);
				if (exec && exec.onclosetag != null) exec.onclosetag(name);
			},
			onend: () => {
				this.reg.forEach((value: AbstractHtmlParser, key, mapObj) => {
					if (value && value.onend != null) value.onend();
				});
			}
		}, {decodeEntities: true});
		parser.write(this.val);
		parser.end();
	}
}

class HtmlFontParser {
	result: (HtmlFontBegin | HtmlFontEnd | HtmlFontText) [] = [];
	indexArr: number[] = [];
	val: string;

	constructor(val) {
		this.val = val;
	}

	onopentag = (name, attribs: { size?: string, color?: string }) => {
		this.indexArr.push(this.result.length);
		let style: HtmlFontStyle = null;
		if (attribs.size != null) {
			if (style == null) style = {};
			style.fontSize = +attribs.size;
		}
		if (attribs.color != null) {
			if (style == null) style = {};
			style.color = attribs.color;
		}
		let obj: HtmlFontBegin = {};
		obj.beginTag = name;
		obj.style = style;
		this.result.push(obj);
	};
	ontext = (text) => {
		let obj: HtmlFontText = {};
		if (this.indexArr.length > 0) {
			obj.text = text;
			obj.styleTagIndex = this.indexArr[this.indexArr.length - 1];
			let startObj: HtmlFontBegin = this.result[obj.styleTagIndex];
			if (startObj != null && startObj.style != null) {
				obj.style = startObj.style;
			}
		} else {
			obj.text = text;
		}
		this.result.push(obj);
	};
	onclosetag = (name) => {
		let obj: HtmlFontEnd = {};
		let beginTagIndex = this.indexArr.pop();

		let beginItem: HtmlFontBegin = this.result[beginTagIndex];
		beginItem.endTagIndex = this.result.length;

		obj.endTag = name;
		obj.beginTagIndex = beginTagIndex;

		this.result.push(obj);
	};
	onend = () => {
	};
}

type HtmlFontBegin = {
	beginTag: string,
	style: HtmlFontStyle,
	endTagIndex: number,
}
type HtmlFontStyle = {
	fontSize: number,
	color: string
}
type HtmlFontEnd = {
	endTag: string,
	beginTagIndex: number,
}
type HtmlFontText = {
	text: string,
	styleTagIndex: number,
	style: HtmlFontStyle,
}

type AbstractHtmlParser = {
	onopentag: Function;
	ontext: Function;
	onclosetag: Function;
	onend: Function;
}