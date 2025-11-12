package org.example.model.enums;

public enum TypeHoraire {
    FULL_TIME("Temps plein"),
    PART_TIME("Temps partiel"),
    UNSELECTED("À spécifier"),
    ;

    private final String string;
    TypeHoraire(String string) {this.string = string;}

    @Override
    public String toString(){
        return string;
    }
}
