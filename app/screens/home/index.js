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
    this.props.interviewsFetcher(this.props.categories.categorySelected.id);
    this.props.categoriesFetcher();
  }

  renderIntro = () => {
    let { categoryModalOpen, categorySelected } = this.props.categories;
    return (
      <TouchableOpacity
        style={styles.headerView}
        onPress={() => {
          this.props.categoryModalAction();
        }}
      >
        <Text style={styles.header}>{categorySelected.name}</Text>
        <IconEntypo
          name={
            categoryModalOpen
              ? "chevron-with-circle-up"
              : "chevron-with-circle-down"
          }
          size={40}
          color={config.colors.thinkerGreen}
          style={styles.iconShare}
        />
      </TouchableOpacity>
    );
  };

  renderActivityIndicator = () => {
    if (
      this.props.interviews.isFetchingInterviews ||
      this.props.categories.isFetchingCategories
    )
      return <ActivityIndicator size="large" color="black" />;
    return null;
  };

  renderItem = (item, index) => {
    if (!index)
      return (
        <VideoItemFeatured
          item={item}
          onPress={() => {
            this.props.selectArticle(item);
            this.props.navigation.navigate("Article");
          }}
        />
      );

    return (
      <VideoItem
        item={item}
        onPress={() => {
          this.props.selectArticle(item);
          this.props.navigation.navigate("Article");
        }}
      />
    );
  };

  render() {
    let {
      errorFetchingInterviews,
      data,
      isFetchingInterviews
    } = this.props.interviews;
    let {
      categorySelected,
      all_categories,
      errorFetchingCategories
    } = this.props.categories;
    let barStyle = "dark-content";
    if (Platform.OS === "android") barStyle = "light-content";
    return (
      <View style={config.styles.containerNoPadding}>
        <StatusBar barStyle={barStyle} />
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
              renderItem: (item, index) => {
                return (
                  <View style={styles.errorView}>
                    <Text style={styles.error}>
                      {errorFetchingInterviews || errorFetchingCategories
                        ? config.strings.errorLoading
                        : ""}
                    </Text>
                  </View>
                );
              }
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
    flex: 1,
    alignItems: "center"
  },
  error: {
    fontSize: 14,
    fontFamily: config.fonts.bodyFont
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
