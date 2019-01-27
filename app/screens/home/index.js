import React from "react";
import {
  Platform,
  ActivityIndicator,
  Text,
  View,
  SectionList,
  StyleSheet,
  StatusBar,
  TouchableOpacity
} from "react-native";
import { connect } from "react-redux";
import {
  interviewsFetcher,
  selectArticle,
  categoriesFetcher,
  selectCategory,
  categoryModalAction,
  resetInterviewsFetcher,
  interviewsScrollToTop
} from "../../actions";
import IconEntypo from "react-native-vector-icons/Entypo";
import Button from "../../components/button";
import VideoItem from "../../components/listItem/videoItem";
import VideoItemFeatured from "../../components/listItem/videoItemFeatured";
import CategoryModal from "../../components/categoryModal";
import config from "../../config";

class HomeScreen extends React.Component {
  constructor(props) {
    super(props);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.interviews.shouldScrollToTop) {
      this.props.interviewsScrollToTop();
      this.sectionList.scrollToLocation({
        sectionIndex: 0,
        itemIndex: 0
      });
    }
    return true;
  }

  componentDidMount() {
    this.startAppFromZero();
  }

  startAppFromZero = () => {
    this.props.interviewsFetcher(this.props.categories.categorySelected.id);
    this.props.categoriesFetcher();
  };

  renderIntro = () => {
    const { categoryModalOpen, categorySelected } = this.props.categories;
    const chevronUp = "chevron-with-circle-up";
    const chevronDown = "chevron-with-circle-down";

    return (
      <TouchableOpacity
        style={styles.headerView}
        onPress={this.props.categoryModalAction}
      >
        <Text style={styles.header}>{categorySelected.name}</Text>
        <IconEntypo
          name={categoryModalOpen ? chevronUp : chevronDown}
          size={40}
          color={config.colors.thinkerGreen}
          style={styles.iconShare}
        />
      </TouchableOpacity>
    );
  };

  renderActivityIndicator = () => {
    const { isFetchingInterviews } = this.props.interviews;
    const { isFetchingCategories } = this.props.categories;

    if (isFetchingInterviews || isFetchingCategories) {
      return <ActivityIndicator size="large" color="black" />;
    }

    return null;
  };

  renderItem = (item, index) => {
    const VideoComponent = index ? VideoItem : VideoItemFeatured;

    return (
      <VideoComponent
        item={item}
        onPress={() => {
          this.props.selectArticle(item);
          this.props.navigation.navigate("Article");
        }}
      />
    );
  };

  renderFooter = ({ section }) => {
    const { isFetchingInterviews, lastPage } = this.props.interviews;

    if (section.data)
      if (section.data.length > 1)
        if (isFetchingInterviews) {
          return (
            <ActivityIndicator
              style={styles.loader}
              size="small"
              color="black"
            />
          );
        } else {
          if (lastPage)
            return (
              <View style={styles.endOfListView}>
                <Text style={styles.endOfListText}>
                  {config.strings.homeScreen.endOfList}
                </Text>
              </View>
            );
          return null;
        }
    return null;
  };

  renderError = () => {
    const { errorFetchingInterviews } = this.props.interviews;
    const { errorFetchingCategories } = this.props.categories;

    if (errorFetchingInterviews || errorFetchingCategories) {
      return (
        <View style={styles.errorView}>
          <Text style={styles.error}>{config.strings.errorLoading}</Text>
          <Button
            message={config.strings.tryAgain}
            iconName={"refresh"}
            onPress={this.startAppFromZero()}
          />
        </View>
      );
    }

    return null;
  };

  render() {
    let { data, isFetchingInterviews } = this.props.interviews;
    let { categorySelected, all_categories } = this.props.categories;

    return (
      <View style={config.styles.containerNoPadding}>
        <StatusBar
          barStyle={Platform.OS === "ios" ? "dark-content" : "light-content"}
        />
        <CategoryModal />
        <SectionList
          ref={sectionList => {
            this.sectionList = sectionList;
          }}
          bounces={false}
          refreshing={false}
          onEndReachedThreshold={0.4}
          onEndReached={() => {
            if (!isFetchingInterviews)
              this.props.interviewsFetcher(categorySelected.id);
          }}
          onRefresh={() => {
            this.props.resetInterviewsFetcher();
            this.props.interviewsFetcher(categorySelected.id);
            this.props.categoriesFetcher();
          }}
          renderSectionFooter={this.renderFooter}
          sections={[
            {
              data: [1],
              keyExtractor: (item, index) => index,
              renderItem: (item, index) => this.renderIntro()
            },
            {
              data: [1],
              keyExtractor: (item, index) => index,
              renderItem: (item, index) => this.renderActivityIndicator()
            },
            {
              data: [1],
              keyExtractor: (item, index) => index,
              renderItem: (item, index) => this.renderError()
            },
            {
              data: all_categories ? (data ? data : "") : "",
              keyExtractor: (item, index) => item.id,
              renderItem: item => this.renderItem(item.item, item.index)
            }
          ]}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  headerView: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 20
  },
  header: {
    fontSize: 24,
    fontFamily: config.fonts.titleFont,
    paddingBottom: 6,
    paddingRight: 6,
    color: config.colors.blackTorn
  },
  errorView: {
    ...config.styles.container,
    alignItems: "center",
    justifyContent: "center"
  },
  error: {
    fontSize: 14,
    fontFamily: config.fonts.bodyFont
  },
  loader: {
    marginTop: 10,
    marginBottom: 10
  },
  endOfListView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  endOfListText: {
    marginTop: 10,
    marginBottom: 10,
    fontSize: 18,
    fontFamily: config.fonts.bodyFont,
    color: config.colors.blackTorn
  }
});

const mapStateToProps = state => {
  return { interviews: state.interviews, categories: state.categories };
};

const mapDispatchToProps = dispatch => {
  return {
    selectArticle: article => dispatch(selectArticle(article)),
    interviewsFetcher: category_id => dispatch(interviewsFetcher(category_id)),
    resetInterviewsFetcher: () => dispatch(resetInterviewsFetcher()),
    categoriesFetcher: () => dispatch(categoriesFetcher()),
    selectCategory: category => dispatch(selectCategory(category)),
    categoryModalAction: () => dispatch(categoryModalAction()),
    interviewsScrollToTop: () => dispatch(interviewsScrollToTop())
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(HomeScreen);
