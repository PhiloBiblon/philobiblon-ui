#!/bin/bash

trap "exit 1" TERM
export TOP_PID=$$

if [[ $# -ne 3 ]]; then
    echo "Usage: $0 <server> <user> <password>"
    exit 1
fi

SERVER="$1"
USER="$2"
PASSWORD="$3"
PAGE_TITLE="Test"
PAGE_CONTENT="Aquest és el contingut de la pàgina."

urlencode() {
    local string="$1"
    echo -n "$string" | jq -sRr @uri
}

curl_request() {
    local response
    response=$(curl -s -w "%{http_code}" -o /tmp/curl_response.json "$@")
    http_code="${response: -3}"
    if [[ "$http_code" != "200" ]]; then
        echo "Error: Curl returned HTTP code $http_code for $@" >&2
        kill -s TERM $TOP_PID
    fi
    cat /tmp/curl_response.json
}

update_page() {
    echo "Updating page '$1' .."
    echo "text=$2" > content.txt
    # replace line breaks
    sed -i ':a;N;$!ba;s/\n/%0D%0A/g' content.txt
    # replace ampersand
    sed -i 's/&/%26/g' content.txt
    CREATE_RESULT=$(curl_request -X POST "$SERVER/w/api.php" -b cookies.txt -c cookies.txt -d "action=edit" -d "title=$1" -d @content.txt -d "token=$CSRF_TOKEN" -d "format=json")

    if [[ $(echo "$CREATE_RESULT" | jq -r '.edit.result') == "Success" ]]; then
        echo "Page '$1' succesfully updated."
    else
        echo "Error updating page '$1': $CREATE_RESULT" >&2
        kill -s TERM $TOP_PID
    fi
}


RAW_LOGIN_TOKEN=$(curl_request -X POST "$SERVER/w/api.php" -d "action=query&meta=tokens&type=login&format=json" -c cookies.txt | jq -r '.query.tokens.logintoken')

LOGIN_TOKEN=$(urlencode "$RAW_LOGIN_TOKEN")
echo "Login token: $LOGIN_TOKEN"

LOGIN_RESULT=$(curl_request -X POST "$SERVER/w/api.php" -b cookies.txt -c cookies.txt -d "action=login&lgname=$USER&lgpassword=$PASSWORD&lgtoken=$LOGIN_TOKEN&format=json")

if [[ $(echo "$LOGIN_RESULT" | jq -r '.login.result') != "Success" ]]; then
    echo "Login error: $LOGIN_RESULT"
    exit 1
fi

echo "Login ok."

RAW_CSRF_TOKEN=$(curl_request -X POST "$SERVER/w/api.php" -b cookies.txt -d "action=query&meta=tokens&type=csrf&format=json" | jq -r '.query.tokens.csrftoken')

CSRF_TOKEN=$(urlencode "$RAW_CSRF_TOKEN")
echo "CSRF Token: $CSRF_TOKEN"

for file in "pages"/*; do
    if [[ -f "$file" ]]; then
        PAGE_TITLE=$(basename "$file")
        PAGE_CONTENT=$(cat "$file")

        update_page "$PAGE_TITLE" "$PAGE_CONTENT" $file
    fi
done
