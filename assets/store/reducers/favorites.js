'use strict';

/* jshint ignore:start */

export default {
  key: 'favorites',
  defaultValue: {},
  reducer: (state, action) => {
    switch (action.type) {
      case 'TOGGLE_FAVORITE':
        const newFavorites = {
          ...state
        };
        const uppercaseSymbol = action.payload.toUpperCase();
        const isFavorite = state[uppercaseSymbol];
        newFavorites[uppercaseSymbol] = !isFavorite;
        return newFavorites;
    }
    return state;
  }
};

/* jshint ignore:end */
