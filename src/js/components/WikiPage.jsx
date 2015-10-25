var WikiPage = React.createClass({
  render: function () {
    return (
      <div className="wiki-page">
        <div className="wiki-page__header">
          <Header/>
        </div>
        <div className="wiki-page__content">
          <WikiContent/>
        </div>
        <div className="wiki-page__footer">
          <Footer/>
        </div>

      </div>
    );
  }

});