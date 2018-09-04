## Watson Discovery Knowledge Graphのハンズオン
Watson Discovery ServiceでKnowledge Graphを利用する手順です。Knowledge Graphは2018/8/30現在Advanced Plan(有償)のみで利用できるEnglishOnlyのBeta機能になるのでご注意ください。

マニュアルへのリンク：https://console.bluemix.net/docs/services/discovery/building-kg.html#watson-discovery-knowledge-graph

---
### Knowledge Graphの大まかな説明
投入したドキュメントに記載されているEntity(カテゴリ付きの単語)とRelation(Entity間の関係)を抽出し知識ベース化する。従来の大量のテキストデータの中から抽出したそれぞれの情報を検索や分析に活用し見るべきドキュメントを探すアプローチ(ドキュメントセントリック)とは異なり、大量のテキストデータから抽出した情報をつなぎ合わせてモノとモノの関係が繋がった状態にしそこから知見を得ていくというアプローチ(ナレッジセントリック)となる。最近の機械学習ベースのAIの苦手な根拠の提示や推論といった領域が期待されている。Discoveryに内蔵されているNLU(Natural Language Understanding)で持っている標準のEntity/Relationを抽出するモデル(news model)を利用することもできるが、各種ドメインのドキュメントを対象にする場合にはWKS(Watson Knowledge Studio:Entity/Relationの抽出を行うモデルの開発ツール)を利用してカスタムモデルを作り、DiscoveryにDeployして利用する。

ユースケースの目的に合わせてKG用のクエリーを発行して結果うけとり、場合によっては可視化して人間の理解や意思決定・判断に役立てる。


---

### このハンズオンの前提
短時間で一連の流れを体感することを主眼に置いたハンズオンとなっています。実際に利用する際にはTypeSystemの複雑性、WKSトレーニングに必要なGround Truthのボリューム、Discoveryに取り込むボリュームなどが異なってきます。


---

### 0.シナリオとデータ、作業の流れ
野球選手の所属チームやリーグの知識ベースを作成し、その知識ベースを元にナレッジの探索を行う。利用データは以下の選手のwikipediaのabstract.(松井、ダルビッシュ、大谷、田中、イチロー)

知識ベースのイメージ：  
![alt](https://github.com/Yoshiomi-Segawa/Disco-KG/blob/picture/%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%BC%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%83%E3%83%88%202018-08-31%2017.57.55.jpg)


作業の流れ：
![alt](https://github.com/Yoshiomi-Segawa/Disco-KG/blob/picture/%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%BC%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%83%E3%83%88%202018-09-03%2013.37.15.jpg)


---


### 1.インスタンスの作成
IBM CloudからWatson Discovery Serviceのインスタンスおよびコレクションを作成する。カスタムモデルを利用する場合はWatson Knowledge Studioのインスタンスも作成する。  
Watson Discovery ServiceについてはAdvanced Plan(有償)が必要  
Watson Knowledge StudioについてはLit Plan(無償)でもハンズオンは可能であるが、複数人で一つのアノテーター開発を行うときにはStandard Plan(有償)以上が必要  


---


### 2.カスタムモデルの作成
#### 2-1. TypeSystem(Entity/Relation)の設計
以下、今回のハンズオンのTypeSystem。実際はユースケースとデータに合わせて設計する必要がある。

| Entity名 | 説明 | 補足
----|----|----
| Person | 人 | 選手
| Organization | 組織・会社 | 球団およびメジャーリーグ
|  |  | 


| Relation名 | 説明 | From | To |
----|----|----|---- 
| employedBy | 雇用関係。今回のシナリオでは選手がどこに所属しているか。 | Person | Organization |
| partOf | 従属関係。今回のシナリオではどの球団がどのリーグか | Organization | Organization |
|  |  |  |  |



#### 2-2. TypeSystemのWKSへの登録
a. WKS管理画面を起動:IBM CloudダッシュボードにあるWKSインスタンスを選択 -> 管理 -> "ツールの起動"  
b. 任意の名前でWorkSpaceを作成  
c. 2-1のTypeSystemをWKSに登録

Entityの登録後の画面：
![alt](https://github.com/Yoshiomi-Segawa/Disco-KG/blob/picture/%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%BC%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%83%E3%83%88%202018-08-30%2016.15.09.jpg)

Relationの登録後の画面：
![alt](https://github.com/Yoshiomi-Segawa/Disco-KG/blob/picture/%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%BC%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%83%E3%83%88%202018-08-30%2016.17.29.jpg)

(参考)製品マニュアルへのリンク：https://console.bluemix.net/docs/services/knowledge-studio/typesystem.html#typesystem



#### 2-3. ドキュメントの登録
WKSに登録できる基本的なファイルフォーマットはcsv(1列目がタイトル、2列目が本文), 登録後アノテーションセット(ヒューマンアノテーションをアサインする単位)を作成する。

a. このディレクトリにある***wks-data.csv*** をupload: Assets -> Documents -> Upload Document Sets  
ドキュメント登録後の画面：
![alt](https://github.com/Yoshiomi-Segawa/Disco-KG/blob/picture/%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%BC%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%83%E3%83%88%202018-08-30%2016.33.26.jpg)

b. アノテーションセットを作成: Create Annotation Sets  
アノテーションセット作成画面：
![alt](https://github.com/Yoshiomi-Segawa/Disco-KG/blob/picture/%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%BC%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%83%E3%83%88%202018-08-30%2016.33.53.jpg)

(参考)製品マニュアルへのリンク：https://console.bluemix.net/docs/services/knowledge-studio/documents-for-annotation.html#documents-for-annotation



#### 2-4. PreAnnotation
簡略化のためにNLUの標準モデルで事前にEntityのアノテーションを実施する。(辞書で実施する方法もあるが今回のハンズオンでは使わない)

a. 設定画面へ移動：Machine Learning Model -> Pre-Annotation -> Natural Language Understanding  
b. TypeSystemとNLU標準のEntity Typeをマッピング  
マッピング設定後の画面：
![alt](https://github.com/Yoshiomi-Segawa/Disco-KG/blob/picture/%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%BC%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%83%E3%83%88%202018-08-30%2016.45.59.jpg)

c. ドキュメントセットへアプライ: Apply This Pre-Annotator -> ドキュメントセットを選択 -> Run  
設定画面：
![alt](https://github.com/Yoshiomi-Segawa/Disco-KG/blob/picture/%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%BC%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%83%E3%83%88%202018-08-30%2016.46.22.jpg)

(参考)製品マニュアルへのリンク：https://console.bluemix.net/docs/services/knowledge-studio/preannotation.html#preannotation



#### 2-5. Ground Truthの作成(ヒューマンアノテーション)
WKSのGround TruthエディターにてEntityの修正とRelationのアノテーションを実施する。

a. アノテーションタスクの追加:Machine Learning Model -> Annotation Tasks -> Add Task  
![alt](https://github.com/Yoshiomi-Segawa/Disco-KG/blob/picture/%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%BC%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%83%E3%83%88%202018-08-30%2016.54.05.jpg)


b. ヒューマンアノテーションの実施:作成したタスクを選択  
![alt](https://github.com/Yoshiomi-Segawa/Disco-KG/blob/picture/%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%BC%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%83%E3%83%88%202018-08-30%2016.55.15.jpg)


c. 5選手分のEntityの修正とRelation, Coreferenceのアノテーションを行う。最後にsaveするのを忘れないように。  
![alt](https://github.com/Yoshiomi-Segawa/Disco-KG/blob/picture/%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%BC%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%83%E3%83%88%202018-08-30%2016.56.12.jpg)

Entity:マーカーを引き、どのエンティティかを選択  
![alt](https://github.com/Yoshiomi-Segawa/Disco-KG/blob/picture/%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%BC%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%83%E3%83%88%202018-08-30%2016.56.33.jpg)

Relation:Entity同士を線でつなぎ、どのRelationかを選択  
![alt](https://github.com/Yoshiomi-Segawa/Disco-KG/blob/picture/%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%BC%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%83%E3%83%88%202018-08-30%2017.01.57.jpg)

Coreference:同じものを順番に選択していき、最後に同じものを選択する(シャープ付きの番号が採番されればOK)  
![alt](https://github.com/Yoshiomi-Segawa/Disco-KG/blob/picture/%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%BC%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%83%E3%83%88%202018-08-30%2017.16.56.jpg)

d. 全て完了したらsubmitを行う。: Submit All Documents  
![alt](https://github.com/Yoshiomi-Segawa/Disco-KG/blob/picture/%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%BC%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%83%E3%83%88%202018-08-30%2017.29.10.jpg)

e. submitされたHumanAnnotationをacceptする。： Machine Learning Model -> Annotation Tasks -> タスクを選択 -> アノテーションセットにチェックを入れて"Accept"  
![alt](https://github.com/Yoshiomi-Segawa/Disco-KG/blob/picture/%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%BC%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%83%E3%83%88%202018-08-30%2017.29.10.jpg)

(通常は複数の人のHumanAnnotation結果を上位者が一貫性の観点からチェック・修正した後に行う作業)　
(参考)製品マニュアルへのリンク：https://console.bluemix.net/docs/services/knowledge-studio/annotate-documents.html#annotate-documents



#### 2-6. MLM(マシンラーニングモデル)作成
a. トレーニングデータを使いカスタムモデルを作成する。: Machine Learning Model -> Performance -> Train and evaluate -> セットを選択し、データの割合(トレーニング、テスト、ブラインド)を変更し"Train"  
トレーニング設定画面：  
![alt](https://github.com/Yoshiomi-Segawa/Disco-KG/blob/picture/%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%BC%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%83%E3%83%88%202018-08-30%2017.29.10.jpg)


(通常はGround Truth(submit/acceptされたHumanAnnotation)をトレーニングとテスト、ブラインドに分けてカスタムモデルの生成とモデルの評価を行う。今回はハンズオンのため評価部分を割愛している。)

通常はこのような割合でデータを分ける：  
![alt](https://github.com/Yoshiomi-Segawa/Disco-KG/blob/picture/%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%BC%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%83%E3%83%88%202018-08-30%2017.16.56.jpg)


b. トレーニングには数分かかるので、終わるまで待つ。


(参考)製品マニュアルへのリンク：https://console.bluemix.net/docs/services/knowledge-studio/train-ml.html#train-ml



#### 2-7. DiscoveryへのDeploy
作成したカスタムモデルを自身のDiscoveryインスタンスへ適用する。同じRegionに存在するDiscoveryにしかDeployできない点に注意。

a. カスタムモデルのスナップショットを取得 ： Machine Learning Model -> Versions -> Take Snapshot -> OK  
![alt](https://github.com/Yoshiomi-Segawa/Disco-KG/blob/picture/%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%BC%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%83%E3%83%88%202018-08-30%2018.03.56.jpg)

b. スナップショットをDiscoveryインスタンスへ適用 ： Deploy -> Discovery -> Next -> 対象を選択して"Deploy"  
![alt](https://github.com/Yoshiomi-Segawa/Disco-KG/blob/picture/%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%BC%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%83%E3%83%88%202018-08-30%2018.06.17.jpg)  
![alt](https://github.com/Yoshiomi-Segawa/Disco-KG/blob/picture/%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%BC%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%83%E3%83%88%202018-08-30%2018.07.12.jpg)

c. Discoveryの設定で使うのでモデルIDを控えておく  
![alt](https://github.com/Yoshiomi-Segawa/Disco-KG/blob/picture/%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%BC%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%83%E3%83%88%202018-08-30%2018.08.00.jpg)

(参考)製品マニュアルへのリンク：https://console.bluemix.net/docs/services/knowledge-studio/publish-ml.html#publish-ml

---

### 3. DiscoveryのKG用設定
ドキュメント登録前に設定をKG用にする必要があります。この設定はGUI(Tooling)からは実施できないのでコマンドにて実施します。KGの前提としてはRelationのモデルが指定されていること、Entityのモデル(Relationと同じもの)が指定され、mentions, mentions_types, sentence_locationsがTrueになっていること。
a. このディレクトリにある***config-default-kg.json*** をローカルにダウンロードして編集し、先ほどDeployしたカスタムモデルのIDを反映

Before：こちらを使うとNLU標準モデルを利用してKGを作ることができます。  
![alt](https://github.com/Yoshiomi-Segawa/Disco-KG/blob/picture/%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%BC%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%83%E3%83%88%202018-08-30%2018.16.01.jpg)


After :  
![alt](https://github.com/Yoshiomi-Segawa/Disco-KG/blob/picture/%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%BC%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%83%E3%83%88%202018-08-30%2018.17.48.jpg)


b. ***config-default-kg.json*** をアップロード(curlコマンド)  
curl -X POST -u "{username}":"{password}" -H "Content-Type: application/json" -d @config-default-kg.json "https://gateway.watsonplatform.net/discovery/api/v1/environments/{environment_id}/configurations?version=2018-08-01"


*IAM環境の場合はusername/passwordをapikeyに変更する。上記URLはDallasのエンドポイントのため、各Regionのものに変更する。*  
(参考)APIリファレンス:https://www.ibm.com/watson/developercloud/discovery/api/v1/curl.html?curl#create-configuration


c. configurationの変更：Manage data -> Configuration -> Switch -> kg_config -> Switch  
![alt](https://github.com/Yoshiomi-Segawa/Disco-KG/blob/picture/%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%BC%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%83%E3%83%88%202018-08-30%2018.38.11.jpg)



---


## 4. Discoveryへのデータ取り込み
a. このディレクトリの***Baseball-Player-wiki*** フォルダの5ファイルをローカルPCにダウンロード  
b. 取り込みした際のエンリッチメント結果をサンプル的に確認：Manage data -> Configuration -> Edit -> 右側のペインでドキュメントを指定、再度そのドキュメントを選択すると取り込みのプレビューができる  
![alt](https://github.com/Yoshiomi-Segawa/Disco-KG/blob/picture/%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%BC%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%83%E3%83%88%202018-08-30%2018.43.48.jpg)

![alt](https://github.com/Yoshiomi-Segawa/Disco-KG/blob/picture/%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%BC%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%83%E3%83%88%202018-08-30%2018.44.38.jpg)

c. aにてダウンロードしたファイルを全て取り込み : Manage data -> "Drag and drop your documents here
or browse from computer"  
![alt](https://github.com/Yoshiomi-Segawa/Disco-KG/blob/picture/%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%BC%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%83%E3%83%88%202018-08-30%2018.48.13.jpg)


以下のように"Errors and warnings"が0件で、"Document count"が5件となって入れば正常にuploadが完了している。  
![alt](https://github.com/Yoshiomi-Segawa/Disco-KG/blob/picture/%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%BC%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%83%E3%83%88%202018-08-30%2019.06.13.jpg)


---


## 5. クエリーの発行
Toolingにてクエリーを発行: Build queries -> Knowledge Graph

![alt](https://github.com/Yoshiomi-Segawa/Disco-KG/blob/picture/%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%BC%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%83%E3%83%88%202018-08-30%2020.04.59.jpg)


---


## 6. 可視化
可視化ツールは現時点で提供されていないため、GraphvizというオープンソースのToolを使ってクエリーの結果を可視化。
http://www.webgraphviz.com/

a. Discovery Tooling画面をChromeで開き、右クリックで「検証」を選択  
b. Discovery ToolingからRelationのクエリーを発行  
c. "Console"に切り替え、 このディレクトリにある***visualize.js*** の内容をコピー&ペースト  
![alt](https://github.com/Yoshiomi-Segawa/Disco-KG/blob/picture/%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%BC%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%83%E3%83%88%202018-08-30%2020.17.54.jpg)


d. "Console"に出力される内容をコピーし、Graphvizのウィンドウにペースト  
![alt](https://github.com/Yoshiomi-Segawa/Disco-KG/blob/picture/%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%BC%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%83%E3%83%88%202018-08-30%2020.18.12.jpg)

![alt](https://github.com/Yoshiomi-Segawa/Disco-KG/blob/picture/%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%BC%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%83%E3%83%88%202018-08-30%2020.18.48.jpg)


e. 二つ目のEntityについても同様にb,cの手順にてクエリーの結果を変換し、コピー。その内容をGraphvizのウィンドウに追加することにより二つのEntityの関係が視覚的につかめる。  
![alt](https://github.com/Yoshiomi-Segawa/Disco-KG/blob/picture/%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%BC%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%83%E3%83%88%202018-08-30%2020.20.39.jpg)

![alt](https://github.com/Yoshiomi-Segawa/Disco-KG/blob/picture/%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%BC%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%83%E3%83%88%202018-08-30%2020.21.02.jpg)

