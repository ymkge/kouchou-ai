from status_update_common import Config, GithubHandler, STATUS_NO_STATUS, STATUS_COLD_LIST, STATUS_NEED_REFINEMENT, STATUS_READY, STATUS_IN_PROGRESS
import os

def main():
    config = Config()
    github_handler = GithubHandler(config)
    
    try:
        current_status, item_id = github_handler.get_issue_status_and_id()
    except Exception as e:
        print(f"ステータスの取得に失敗しました: {e}")
        raise ValueError("ステータスの取得に失敗しました")
    
    if github_handler.action == "assigned":
        if current_status in [STATUS_NO_STATUS, STATUS_COLD_LIST, STATUS_NEED_REFINEMENT, STATUS_READY]:
            print(f"担当者が割り当てられ、ステータスが '{current_status}' のため、'{STATUS_IN_PROGRESS}' に更新します。")
            try:
                github_handler.update_issue_status(STATUS_IN_PROGRESS, item_id)
            except Exception as e:
                print(f"ステータスの更新に失敗しました: {e}")
                raise ValueError("ステータスの更新に失敗しました")
        else:
            print(f"ステータスは '{current_status}' です。更新は不要です。")
    elif github_handler.action == "unassigned":
        if current_status == STATUS_IN_PROGRESS:
            print(f"担当者が外れ、ステータスが '{current_status}' のため、'{STATUS_READY}' に更新します。")
            try:
                github_handler.update_issue_status(STATUS_READY, item_id)
            except Exception as e:
                print(f"ステータスの更新に失敗しました: {e}")
                raise ValueError("ステータスの更新に失敗しました")
        else:
            print(f"ステータスは '{current_status}' です。更新は不要です。")

if __name__ == "__main__":
    main()