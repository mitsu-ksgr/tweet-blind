#!/usr/bin/env bash
set -eu

readonly SCRIPT_NAME=$(basename $0)
readonly DTAG="tweetblind"

usage() {
    cat << __EOS__
Usage: ${SCRIPT_NAME} [MODE]

MODE:
    build   re-build docker image
    run     bash
    fmt     format
    lint    lint
    fix     format & lint

TODO: ちゃんとする
__EOS__
}


exists_image() {
    local -r tag="${1:-}"
    local -r cmd="docker images -q ${tag}"
    echo "$(eval ${cmd})"
}

rund() {
    local -r tag="${1:-}"
    local -r cmd="${2:-}"
    docker run --rm -v ./:/app "${tag}" ${cmd}
}


main() {
    local -r mode="${1:-}"
    local -r opt="${2:-}"

    if [ -z "$(exists_image "${DTAG}")" ]; then
        docker build -t "${DTAG}" .
    fi

    case "${mode}" in
        #
        # Docker task
        #
        "build" )
            docker build -t "${DTAG}" .
            ;;

        "run" )
            docker run --rm -it -v ./:/app "${DTAG}" /bin/bash
            ;;


        #
        # Formatter & Linter
        #
        "fmt" | "format" )
            if [ "${opt}" == "-f" -o "${opt}" == "--fix" ]; then
                rund "${DTAG}" "yarn fmt-fix"
            else
                rund "${DTAG}" "yarn fmt"
            fi
            ;;

        "lint" | "linter" )
            if [ "${opt}" == "-f" ]; then
                rund "${DTAG}" "yarn lint-fix"
            else
                rund "${DTAG}" "yarn lint"
            fi
            ;;

        "fix" )
            rund "${DTAG}" "yarn fix"
            ;;

        "" | "check" )
            rund "${DTAG}" "yarn checkonly"
            ;;


        #
        # Misc.
        #
        "help" | "-h" )
            usage
            ;;

        * )
            usage
            ;;
    esac

}


#
# Entry point.
#
cd "$(dirname $0)"
main $@
exit 0

