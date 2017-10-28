import React, { Component } from 'react';
import { TouchableOpacity, Text } from 'react-native';
import {
  unstable_createCall as createCall,
  unstable_createReturn as createReturn,
} from 'react-call-return';
import PropTypes from 'prop-types';
import { matchPath, Route } from 'react-router-native';
import { CardStack, Header } from './navigation-experimental';

export const Navigator = ({
  children,
  mode,
  headerMode,
  cardStyle,
  transitionConfig,
  onTransitionStart,
  onTransitionEnd,
  navigationOptions,
}) =>
  createCall(children, NavigatorHandler, {
    mode,
    headerMode,
    cardStyle,
    transitionConfig,
    onTransitionStart,
    onTransitionEnd,
    navigationOptions,
  });

export const Screen = props => createReturn(props);

export const Link = ({ to, label, ...props }) => (
  <Route>
    {({ history }) => (
      <TouchableOpacity {...props} onPress={() => history.push(to)}>
        <Text>{label}</Text>
      </TouchableOpacity>
    )}
  </Route>
);

Link.propTypes = {
  label: PropTypes.string.isRequired,
  to: PropTypes.string.isRequired,
};

const NavigatorHandler = (props, screens) => (
  <NavigatorInner {...props} screens={screens} />
);

class NavigatorInner extends Component {
  static propTypes = {
    screens: PropTypes.array.isRequired,
    cardStyle: CardStack.propTypes.cardStyle,
    direction: CardStack.propTypes.direction,
    gestureResponseDistance: PropTypes.number,
    cardStyleInterpolator: PropTypes.func,
    enableGestures: CardStack.propTypes.enableGestures,
    style: CardStack.propTypes.style,
    scenesStyle: CardStack.propTypes.scenesStyle,
  };

  renderScene = sceneProps => {
    const { scene: { route: { screen: { body } } } } = sceneProps;
    return body;
  };

  renderTitleComponent = sceneProps => {
    const { scene: { route: { screen: { title } } } } = sceneProps;
    if (title) {
      if (React.isValidElement(title)) {
        return title;
      }
      return <Header.Title>{title}</Header.Title>;
    }
    return null;
  };

  renderRightComponent = sceneProps => {
    const { scene: { route: { screen: { right } } } } = sceneProps;
    if (right && React.isValidElement(right)) {
      return right;
    }
    return null;
  };

  renderLeftComponent = sceneProps => {
    const {
      scene: { route: { screen: { left }, history }, index },
    } = sceneProps;
    if (left && React.isValidElement(left)) {
      return left;
    }
    return index > 0 ? (
      <Header.BackButton onPress={() => history.goBack()} />
    ) : (
      left
    );
  };

  renderHeader = sceneProps => {
    const { scene: { route: { screen: { header } } } } = sceneProps;
    if (header && React.isValidElement(header)) {
      return React.cloneElement(header, sceneProps);
    }
    return (
      <Header
        {...sceneProps}
        renderTitleComponent={this.renderTitleComponent}
        renderRightComponent={this.renderRightComponent}
        renderLeftComponent={this.renderLeftComponent}
      />
    );
  };

  render() {
    const {
      screens,
      direction,
      cardStyle,
      style,
      gestureResponseDistance,
      enableGestures,
      cardStyleInterpolator,
      scenesStyle,
    } = this.props;

    return (
      <Route>
        {({ history }) => {
          const routes = history.entries
            .slice(0, history.index + 1)
            .map(location => {
              for (let i = 0; i < screens.length; i++) {
                const screen = screens[i];
                const {
                  path: pathProp,
                  exact,
                  strict,
                  sensitive,
                  from,
                } = screen;
                const path = pathProp || from;
                const match = matchPath(location.pathname, {
                  path,
                  exact,
                  strict,
                  sensitive,
                });
                if (match) {
                  return { screen, key: location.key, history };
                }
              }
              return null;
            });

          return (
            <CardStack
              navigationState={{
                index: history.index,
                routes,
              }}
              renderHeader={this.renderHeader}
              renderScene={this.renderScene}
              direction={direction}
              onNavigateBack={() => history.goBack()}
              cardStyle={cardStyle}
              style={style}
              gestureResponseDistance={gestureResponseDistance}
              enableGestures={enableGestures}
              cardStyleInterpolator={cardStyleInterpolator}
              scenesStyle={scenesStyle}
            />
          );
        }}
      </Route>
    );
  }
}
