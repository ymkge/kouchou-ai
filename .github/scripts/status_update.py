from status_update_common import Config, GithubHandler, STATUS_NO_STATUS, STATUS_COLD_LIST, STATUS_NEED_REFINEMENT, STATUS_READY, STATUS_IN_PROGRESS

def update_issue_status(github_handler, status, item_id):
    try:
        github_handler.update_issue_status(status, item_id)
        print(f"ステータスを '{status}' に更新しました。")
    except Exception as e:
        print(f"ステータスの更新に失敗しました: {e}")
        raise ValueError("ステータスの更新に失敗しました") from e

def main():
    config = Config()
    github_handler = GithubHandler(config)
    
    try:
        current_status, item_id = github_handler.get_issue_status_and_id()
    except Exception as e:
        print(f"ステータスの取得に失敗しました: {e}")
        raise ValueError("ステータスの取得に失敗しました") from e
    
    if github_handler.action == "assigned":
        if current_status in [STATUS_NO_STATUS, STATUS_COLD_LIST, STATUS_NEED_REFINEMENT, STATUS_READY]:
            print(f"担当者が割り当てられ、ステータスが '{current_status}' のため、'{STATUS_IN_PROGRESS}' に更新します。")
            update_issue_status(github_handler, STATUS_IN_PROGRESS, item_id)
        else:
            print(f"ステータスは '{current_status}' です。更新は不要です。")
    elif github_handler.action == "unassigned":
        if current_status == STATUS_IN_PROGRESS:
            print(f"担当者が外れ、ステータスが '{current_status}' のため、'{STATUS_READY}' に更新します。")
            update_issue_status(github_handler, STATUS_READY, item_id)
        else:
            print(f"ステータスは '{current_status}' です。更新は不要です。")
    else :
        print(f"アクション '{github_handler.action}' はサポートされていません。")
        raise ValueError(f"アクション '{github_handler.action}' はサポートされていません。")

if __name__ == "__main__":
    main()