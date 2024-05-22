class ArticlesController < ApplicationController


  # http_basic_authenticate_with name: "BASIC_AUTH_USER", password: "BASIC_AUTH_PASSWORD", 
  # except: [:index, :show]



  # 記事の一覧を取得するアクション
  def index
    @articles = Article.all
  end

  # 指定した記事の詳細を取得するアクション
  def show
    @article = Article.find(params[:id])
  end

  # 新規記事作成用のフォームを表示するアクション
  def new
    @article = Article.new
  end

  # 新規記事を作成するアクション
  def create
    # 新しい記事オブジェクトを作成（ここでは仮の値を設定）
    #@article = Article.new(title: "...", body: "...")
    @article = Article.new(article_params)

    # 記事を保存できたかどうかを判断
    if @article.save
      # 保存できた場合は、その記事の詳細ページにリダイレクト
      redirect_to @article
    else
      # 保存できなかった場合は、newビューを再表示
      render :new
    end
  end

  def edit
    @article = Article.find(params[:id])
  end

  def update
    @article = Article.find(params[:id])

    if @article.update(article_params)
      redirect_to @article
    else
      render :edit
    end
  end


  def destroy
    @article = Article.find_by(id: params[:id])
    #logger.debug "Article found: #{@article.inspect}"
    if @article.nil?
      redirect_to articles_path, alert: "記事が見つかりませんでした。"
    elsif @article.destroy
      redirect_to articles_path, notice: "記事が削除されました。"
    else
      redirect_to articles_path, alert: "記事の削除に失敗しました。"
    end
  end
  
    private
      def article_params
        params.require(:article).permit(:title, :body, :status)
      end

end