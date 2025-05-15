# Projects status 更新の共通処理

from math import e
import os
import json
import requests
from github import Github

if not os.getenv('GITHUB_ACTIONS'):
    from dotenv import load_dotenv
    load_dotenv()

# 以下、digitaldemocracy2030/kouchou-ai の設定
REPO_OWNER = "digitaldemocracy2030"
REPO_NAME = "kouchou-ai"
PROJECT_ID = "PVT_kwDODCKp5M4A00DQ"
PROJECT_NO = 3
STATUS_FIELD_ID = "PVTSSF_lADODCKp5M4A00DQzgqYqoE"
STATUS_NO_STATUS = None
STATUS_COLD_LIST = "Cold List"
STATUS_NEED_REFINEMENT = "Need Refinement"
STATUS_READY = "Ready"
STATUS_IN_PROGRESS = "In Progress"
STATUS_DONE = "Done"
STATUS_ARCHIVED = "Archived"

class Config:
    def __init__(self):
        print("設定の初期化を開始します...")
        self.github_token = os.getenv("GITHUB_TOKEN")
        if self.github_token is None:
            print("GITHUB_TOKENが見つかりません ...")
            raise ValueError("GITHUB_TOKENが見つかりません")
        
        self.github_repo = os.getenv("GITHUB_REPOSITORY")
        if self.github_repo is None:
            print("GITHUB_REPOSITORYが見つかりません ...")
            raise ValueError("GITHUB_REPOSITORYが見つかりません")
        
        self.project_token = os.getenv("PROJECT_TOKEN")
        if self.project_token is None:
            print("PROJECT_TOKENが見つかりません...")
            raise ValueError("PROJECT_TOKENが見つかりません")
        
        self.issue_number = os.getenv("GITHUB_EVENT_ISSUE_NUMBER")
        if self.issue_number is None:
            print("GITHUB_EVENT_ISSUE_NUMBERが見つかりません...")
            raise ValueError("GITHUB_EVENT_ISSUE_NUMBERが見つかりません")
        else:
            self.issue_number = int(self.issue_number)

        self.action = os.getenv("GITHUB_EVENT_ACTION")
        if self.action is None:
            print("GITHUB_EVENT_ACTIONが見つかりません...")
            raise ValueError("GITHUB_EVENT_ACTIONが見つかりません")
        
        print("設定の初期化が完了しました")

class GithubHandler:
    def __init__(self, config: Config):
        self.config = config
        try:
          self.github = Github(config.github_token)
          self.repo = self.github.get_repo(config.github_repo)
          self.issue_number = config.issue_number
          self.issue = self.repo.get_issue(config.issue_number)
        except Exception as e:
          print(f"GitHub APIの初期化に失敗しました: {e}")
          raise ValueError("GitHub APIの初期化に失敗しました")

    def send_graphql_request(self, query: str, variables: dict):
        """GraphQL APIを使用してリクエストを送信する"""

        headers = {
            "Authorization": f"Bearer {self.config.project_token}",
            "Content-Type": "application/json"
        }
        response = requests.post(
            "https://api.github.com/graphql",
            headers=headers,
            json={"query": query, "variables": variables}
        )
        if response.status_code != 200:
            print(f"GraphQL APIからのエラー: {response.text}")
            raise ValueError("GraphQL APIからのエラーによりリクエストを送信できません")
        resjson = response.json()
        if resjson.get("errors"):
            print(f"GraphQL APIからのエラー: {resjson['errors']}")
            raise ValueError("GraphQL APIからエラーが返されました")
        if resjson.get("data") is None:
            print("GraphQL APIからのレスポンスにデータがありません")
            raise ValueError("GraphQL APIからのレスポンスにデータがありません")
        
        return resjson.get("data")
    
    def get_issue_status_and_id(self):
        """GraphQL APIを使用してIssueの現在のステータスを取得する"""
        
        query = """
        query($repoOwner: String!, $projectNo: Int!) {
          organization(login: $repoOwner) {
            projectV2(number: $projectNo) {
              ... on ProjectV2 {
                items(first: 100) {
                  nodes {
                    id
                    content {
                      ... on Issue {
                        number
                        repository {
                          name
                        }
                      }
                    }
                    fieldValueByName(name: "Status") {
                      ... on ProjectV2ItemFieldSingleSelectValue {
                        name
                      }
                    }
                  }
                }
              }
            }
          }
        }
        """
        variables = {
            "repoOwner": REPO_OWNER,
            "projectNo": PROJECT_NO
        }
        data = self.send_graphql_request(query, variables)
        project_items = data.get("organization", {}).get("projectV2", {}).get("items", {}).get("nodes", [])
        
        for item in project_items:
            content = item.get("content")
            if content and content.get("number") == self.issue_number and content.get("repository", {}).get("name") == REPO_NAME:
              field_value = item.get("fieldValueByName")
              if field_value:
                return field_value.get("name"), item["id"]
              return STATUS_NO_STATUS, item["id"]
        print("Projectにこのissueが見つかりません。アイテム数:", len(project_items))
        raise ValueError("Projectにこのissueが見つかりません")
    
    def update_issue_status(self, status: str, item_id: str):
        """GraphQL APIを使用してIssueのステータスを更新する"""
        
        # まず更新後のstatus（名称）に対応するIDを調べる
        
        query = """
        query($fieldId: ID!) {
          node(id: $fieldId) {
            ... on ProjectV2SingleSelectField {
              options {
                id
                name
              }
            }
          }
        }
        """
        variables = {
            "fieldId": STATUS_FIELD_ID
        }
        data = self.send_graphql_request(query, variables)
        options = data.get("node", {}).get("options", [])
        
        option_id = None
        for option in options:
            if option["name"] == status:
                option_id = option["id"]
                break
        
        if not option_id:
            print(f"ステータス '{status}' のオプションが見つかりません")
            raise ValueError(f"ステータス '{status}' のオプションが見つかりません")

        # 更新後のstatus（名称）に対応するIDが見つかったので、更新する
        
        mutation = """
        mutation($projectId: ID!, $itemId: ID!, $fieldId: ID!, $optionId: String!) {
          updateProjectV2ItemFieldValue(input: {
            projectId: $projectId,
            itemId: $itemId,
            fieldId: $fieldId,
            value: {
              singleSelectOptionId: $optionId
            }
          }) {
            projectV2Item {
              id
              content {
                ... on Issue {
                  number
                  repository {
                    name
                  }
                }
              }
              fieldValueByName(name: "Status") {
                ... on ProjectV2ItemFieldSingleSelectValue {
                  name
                }
              }
            }
          }
        }
        """
        variables = {
            "projectId": PROJECT_ID,
            "itemId": item_id,
            "fieldId": STATUS_FIELD_ID,
            "optionId": option_id
        }
        self.send_graphql_request(mutation, variables)
        print(f"ステータスを '{status}' に正常に更新しました")