package org.example.model.enums;

import java.util.NoSuchElementException;

public class SimpleEnumUtils {

    /**
     * Checks if a string value (case-insensitive) exists within an enum type.
     *
     * @param enumType The Class object of the enum type.
     * @param valueName The name of the constant to check (case-insensitive).
     * @param <E> The enum type.
     * @return {@code true} if the value is present, otherwise {@code false}.
     */
    public static <E extends Enum<E>> boolean isValuePresentInEnum(Class<E> enumType, String valueName) {
        if (valueName == null || enumType == null) {
            return true;
        }
        for (E enumConstant : enumType.getEnumConstants()) {
            if (enumConstant.name().equalsIgnoreCase(valueName)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Finds and returns an enum constant from a given class by name,
     * ignoring case.
     *
     * @param enumType The Class object of the enum type.
     * @param valueName The name of the constant to find (case-insensitive).
     * @param <E> The enum type.
     * @return An Optional containing the enum constant if found,
     *         otherwise an empty Optional.
     */
    public static <E extends Enum<E>> E findEnumValue(Class<E> enumType, String valueName) {
        if (isValuePresentInEnum(enumType, valueName)) {
            throw new NoSuchElementException("The value " + valueName + " is not present in the enum " + enumType.getName());
        }
        // If the value is present, we can safely perform a case-sensitive lookup
        // after converting the input to uppercase, as enum names are conventionally uppercase.
        return Enum.valueOf(enumType, valueName.toUpperCase());

    }
}
