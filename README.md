# Disco-KG
Watson Discovery ServiceでKnowledge Graphを利用する手順です。Knowledge Graphは2018/8/30現在Advanced Plan(有償)のみで利用できるEnglishOnlyのBeta機能になるのでご注意ください。

公式マニュアル：https://console.bluemix.net/docs/services/discovery/building-kg.html#watson-discovery-knowledge-graph


## KGの大まかな説明
投入したドキュメントに記載されているEntity(カテゴリ付きの単語)とRelation(Entity間の関係)を抽出し知識ベース化する。最近の機械学習ベースのAIの苦手な根拠の提示や推論といった領域が期待されている。Discoveryに内蔵されているNLU(Natural Language Understanding)で持っている標準のEntity/Relationを抽出するモデル(news model)を利用することもできるが、各種ドメインのドキュメントを対象にする場合にはWKS(Watson Knowledge Studio:Entity/Relationの抽出を行うモデルの*開発ツール*)を利用してカスタムモデルを作り、DiscoveryにDeployして利用する。

ユースケースの目的に合わせてKG用のクエリーを発行して結果うけとり、場合によっては可視化して人間の理解や意思決定・判断に役立てる。


## 前提
短時間で一連の流れを体感するためのハンズオン用のシナリオ・データに合わせた手順となっているため、実際に利用する際には少し異なるところも発生します。


## 0.シナリオ・データ


## 1.インスタンス作成
IBM CloudからWatson Discovery Serviceのインスタンスを作成する。カスタムモデルを利用する場合はWatson Knowledge Studioのインスタンスも作成する。


## 2.カスタムモデルの作成
### 2-1. TypeSystem(Entity/Relation)の設計
| Entity名 | 説明 |
----|---- 
| Person | 人 |
| Location | 場所 |
| Organization | 組織・会社 |


| Relation名 | 説明 | From | To |
----|----|----|---- 
| locatedAt | Entityがどこに存在するか | Person,Organization | Location |
| employedBy | Personがどこで働いているか | Person | Organization |
| bornIn | Personがどこで生まれたか | Person | Location |


### 2-2. TypeSystemのWKSへの登録
a. WKS管理画面を起動
b. 任意の名前でWorkSpaceを作成
c. 上記のTypeSystemをWKSに登録

マニュアル：https://console.bluemix.net/docs/services/knowledge-studio/typesystem.html#typesystem
参考画像：


### 2-3. ドキュメントの登録
WKSに登録できる基本的なファイルフォーマットはcsv, 登録後アノテーションセット(ヒューマンアノテーションをアサインする単位)を作成
a. xxx.csvをupload: Assets -> Documents -> Upload Document Sets
b. アノテーションセットを作成: Create Annotation Sets

マニュアル：https://console.bluemix.net/docs/services/knowledge-studio/documents-for-annotation.html#documents-for-annotation
参考画像：


### 2-4. PreAnnotation
簡略化のためにNLUの標準モデルで事前にEntityのアノテーションを実施(辞書で実施する方法もあるが今回は使わない)
a. 設定画面へ移動：Machine Learning Model -> Pre-Annotation -> Natural Language Understanding
b. TypeSystemとNLU標準のEntity Typeをマッピング
c. ドキュメントセットへアプライ: Apply This Pre-Annotator

マニュアル：https://console.bluemix.net/docs/services/knowledge-studio/preannotation.html#preannotation
参考画像：


### 2-5. Ground Truthの作成(ヒューマンアノテーション)
Entityの修正とRelationのアノテーション
a. アノテーションタスクの追加:Machine Learning Model -> Annotation Tasks -> Add Task
b. ヒューマンアノテーションの実施:
c. 

マニュアル：https://console.bluemix.net/docs/services/knowledge-studio/annotate-documents.html#annotate-documents
参考画像：


### 2-6. MLM(マシンラーニングモデル)作成



### 2-7. DiscoveryへのDeploy



## 3. DiscoveryのKG用設定
ドキュメント登録前に設定をKG用にする必要があります。この設定はGUI(Tooling)からは実施できないのでコマンドにて実施します。KGの前提としてはRelationのモデルが指定されていること、Entityのモデル(Relationと同じもの)が指定され、mentions, mentions_types, sentence_locationsがTrueになっていること。
a. xxx.jsonを編集し、先ほどDeployしたカスタムモデルのIDを反映
参考画像：

b. xxx.jsonをアップロード(curlコマンド)
curl -X POST -u "{username}":"{password}" -H "Content-Type: application/json" -d @config-default-kg.json "https://gateway.watsonplatform.net/discovery/api/v1/environments/{environment_id}/configurations?version=2017-11-07"

c. configurationの変更：Manage data -> Configuration -> Switch -> kg_config -> Switch


* IAM環境の場合はusername/passwordをapikeyに変更する。
APIリファレンス:https://www.ibm.com/watson/developercloud/discovery/api/v1/curl.html?curl#create-configuration


## 4. Discoveryへのデータ取り込み
a. 取り込みした際のエンリッチメント結果をサンプル的に確認：Manage data -> Configuration -> Edit
参考画像：

b. 取り込み：Manage data -> Upload documents


## 5. クエリーの発行
Build queries -> Knowledge Graph



## 6. 可視化
可視化ツールは現時点で提供されていないため、GraphvizというオープンソースのToolを使ってクエリーの結果を可視化。
http://www.webgraphviz.com/

a. Discovery Tooling画面をChromeで開き、右クリックで「検証」を選択
b. "Console"に切り替え、xxx.jsの内容をコピー&ペースト
参考画像：
c. Discovery Toolingからクエリー発行
. "Console"に出力される内容をコピーし、Graphvizのウィンドウにペースト

