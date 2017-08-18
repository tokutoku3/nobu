__APP=/x/nobu/bot.js
__PIDFILE=/x/nobu/nobu.pid
__LOGFILE=/x/nobu/logs/app.log

all: help

help: ## Show this help.
	@fgrep -h "##" $(MAKEFILE_LIST) | fgrep -v fgrep | sed -e 's/\\$$//' | sed -e 's/##//'

# --------------------
# -- prerequisites
# --------------------
status-stopped: ## nobuが停止状態か返す
	@if [ -e $(__PIDFILE) ]; then \
		echo $$'\e[33mERROR\e[m nobu is already working.'; \
		exit 1 ;\
	fi

status-started: ## nobuが起動状態か返す
	@if [ ! -e $(__PIDFILE) ]; then \
		echo $$'\e[33mERROR\e[m nobu is not working.'; \
		exit 1 ;\
	fi

# --------------------
# -- 起動/停止 関連
# --------------------
start: status-stopped ## nobuの起動
	forever start -l $(__LOGFILE) --pidFile $(__PIDFILE) -a $(__APP)

stop: status-started ## nobuの停止
	cat $(__PIDFILE) | xargs forever stop

restart: ## nobuの再起動
	@if [ -e $(__PIDFILE) ]; then \
		make stop; \
	fi; \
	make start;
