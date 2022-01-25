FROM alpine
LABEL "repository"="https://github.com/cardinalby/actions-test"
LABEL "homepage"="https://github.com/cardinalby/actions-test"

COPY entrypoint.sh /entrypoint.sh
RUN ["chmod", "+x", "/entrypoint.sh"]

RUN apk update && apk add bash && apk add jq

ENTRYPOINT ["/entrypoint.sh"]