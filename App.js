import React, {Component} from 'react';
import {StyleSheet, View} from 'react-native';
import HtmlText from "./src/HtmlText";

type Props = {};
export default class App extends Component<Props> {
    render() {
        const labels: [] = [
            "<Font size='32'>口口1<font size='42'></font></Font>",
            "口口2",
            "",
            "<font size='32'>口口4<font size='42'></font><font size='32'>口口<font size='20'></font>",
            "<font size='32'>口口5<font size='62'>田田",
            "口口<font size='32'>田田6<font size='42'>",
            "<font size='32'>口口7<font size='42' color='#00ff00'>田田</font>困困<font color='#ff00ff'>㘝㘝</font>国国?</font>",
        ];
        return (
            <View style={styles.container}>
                <View style={{marginTop: 20, alignSelf: "flex-start"}}>
                    {labels.map((val: string, index: number, arr: []) => <HtmlText key={index}
                                                                                   style={styles.ruleHtmlTxt}>{val}</HtmlText>)}
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
    ruleHtmlTxt: {
        color: "#0000ff",
        fontSize: 6,
        maxWidth: 260,
    },
});
