/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */

import React from 'react';
import { Text, View, StyleSheet, TextInput, Button } from 'react-native';
import { MemoryRouter } from 'react-router-native';
import { Navigator, Screen, Link } from './src/navigator';

function App() {
  return (
    <MemoryRouter>
      <Navigator>
        <A path="/" exact />
        <B path="/b" exact />
        <C path="/c" exact />
      </Navigator>
    </MemoryRouter>
  );
}
export default App;

const A = props => (
  <Screen
    {...props}
    title="A"
    body={
      <View style={styles.scene}>
        <Link to="/b" label="Go to B" />
      </View>
    }
  />
);

class B extends React.Component {
  state = { title: 'B' };
  render() {
    return (
      <Screen
        {...this.props}
        title={this.state.title}
        body={
          <View style={styles.scene}>
            <Text style={styles.text}>Chandge my title</Text>
            <TextInput
              style={styles.input}
              onChangeText={title => {
                this.setState({ title });
              }}
            />
            <Link to="/c" label="Go to C" />
          </View>
        }
      />
    );
  }
}

class C extends React.Component {
  state = { green: false };
  render() {
    return (
      <Screen
        {...this.props}
        title="C"
        right={
          <Button
            title="Change my color"
            onPress={() => {
              this.setState(({ green }) => ({ green: !green }));
            }}
          />
        }
        body={
          <View
            style={[
              styles.scene,
              { backgroundColor: this.state.green ? 'green' : 'white' },
            ]}
          >
            <Link to="/" label="Go to A" />
          </View>
        }
      />
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scene: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  text: {
    fontSize: 16,
  },
  input: {
    height: 40,
    borderWidth: 2,
    width: 100,
  },
});
