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


### 2-3. ドキュメントの登録


### 2-4. PreAnnotation
簡略化のためにNLUの標準モデルで事前にEntityのアノテーションを実施


### 2-5. Ground Truthの作成(ヒューマンアノテーション)
Entityの修正とRelationのアノテーション


### 2-6. MLM(マシンラーニングモデル)作成


### 2-7. DiscoveryへのDeploy


## 3. DiscoveryのKG用設定


## 4. Discoveryへのデータ取り込み


## 5. クエリーの発行


## 6. 可視化
